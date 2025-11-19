using Application.DTOs;
using Domain.Constants;
using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Payments.Commands
{
    public class CreatePaymentCommand : IRequest<Guid>
    {
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? Note { get; set; }
    }

    public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Guid>
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;
        private readonly IPartnerService _partnerService;
        private readonly IIRSequenceService _sequenceService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<Payment> _paymentRepository;

        public CreatePaymentCommandHandler(
            IPaymentService paymentService,
            IOrderService orderService,
            IPartnerService partnerService,
            IIRSequenceService sequenceService,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext,
            IAsyncRepository<Payment> paymentRepository)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _partnerService = partnerService;
            _sequenceService = sequenceService;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
        }

        public async Task<Guid> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            // Lấy CompanyId từ WorkContext
            var companyId = _workContext?.CompanyId;
            if (companyId == null)
            {
                var ctx = _httpContextAccessor.HttpContext;
                var companyClaim = ctx?.User?.FindFirst("company_id");
                if (companyClaim == null || !Guid.TryParse(companyClaim.Value, out var parsedCompanyId))
                    throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");
                companyId = parsedCompanyId;
            }

            // Lấy UserId từ claim
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            Guid? userId = null;
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsedUserId))
            {
                userId = parsedUserId;
            }

            // Validate Order - Load với OrderItems để tính toán chính xác
            var order = await _orderService.SearchQuery(o => o.Id == request.OrderId)
                .Include(o => o.OrderItem)
                .FirstOrDefaultAsync(cancellationToken);

            if (order == null)
                throw new UserFriendlyException("Đơn hàng không tồn tại.", "ORDER_NOT_FOUND");

            if (order.CompanyId != companyId)
                throw new UserFriendlyException("Đơn hàng không thuộc cửa hàng này.", "ORDER_COMPANY_MISMATCH");

            // Tính tổng tiền đơn hàng từ OrderItems (ưu tiên) hoặc dùng TotalPrice
            // Đảm bảo tính từ quantity * unitPrice để chính xác
            decimal orderTotal = 0;
            if (order.OrderItem != null && order.OrderItem.Any())
            {
                orderTotal = order.OrderItem.Sum(oi => oi.Quantity * oi.UnitPrice);
            }
            else
            {
                orderTotal = order.TotalPrice;
            }

            // Tính tổng tiền đã thanh toán (chỉ tính các payment đã được lưu, không bao gồm payment đang tạo)
            var paidAmount = await _paymentRepository.Table
                .Where(p => p.OrderId == request.OrderId)
                .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

            var remainingAmount = orderTotal - paidAmount;

            // Validate số tiền thanh toán
            if (request.Amount <= 0)
                throw new UserFriendlyException("Số tiền thanh toán phải lớn hơn 0.", "INVALID_AMOUNT");

            if (request.Amount > remainingAmount)
                throw new UserFriendlyException($"Số tiền thanh toán ({request.Amount:N0} đ) không được vượt quá số tiền còn lại ({remainingAmount:N0} đ).", "AMOUNT_EXCEEDS_REMAINING");

            // Validate PaymentMethod
            if (string.IsNullOrWhiteSpace(request.PaymentMethod))
                throw new UserFriendlyException("Phương thức thanh toán không được để trống.", "PAYMENT_METHOD_REQUIRED");

            // Tạo mã thanh toán
            var paymentCode = await _sequenceService.GetNextRefAsync("Payment", companyId, cancellationToken);

            // Tạo Payment
            var payment = new Payment
            {
                CompanyId = companyId,
                OrderId = request.OrderId,
                PartnerId = order.PartnerId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                PaymentDate = request.PaymentDate,
                Note = request.Note,
                PaymentCode = paymentCode,
                CreatedBy = userId
            };

            // Lưu Payment
            await _paymentService.CreateAsync(payment);

            // Cập nhật PaymentStatus của Order
            var newPaidAmount = paidAmount + request.Amount;
            var newRemainingAmount = orderTotal - newPaidAmount;

            if (newRemainingAmount <= 0)
            {
                order.PaymentStatus = "Paid";
                // Khi thanh toán xong, chuyển trạng thái order thành "Delivered" (Đã giao cho khách)
                if (order.Status != OrderStatus.Delivered)
                {
                    order.Status = OrderStatus.Delivered;
                }
            }
            else if (newPaidAmount > 0)
            {
                order.PaymentStatus = "PartiallyPaid";
            }

            await _orderService.UpdateAsync(order);

            return payment.Id;
        }
    }
}


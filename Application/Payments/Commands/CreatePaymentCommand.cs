using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Payments.Commands
{
    public class CreatePaymentCommand : IRequest<Guid>
    {
        public Guid OrderId { get; set; }
        public Guid PartnerId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string? Note { get; set; }
    }

    public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Guid>
    {
        private readonly IOrderService _orderService;
        private readonly IPartnerService _partnerService;
        private readonly IIRSequenceService _sequenceService;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<Payment> _paymentRepository;

        public CreatePaymentCommandHandler(
            IOrderService orderService,
            IPartnerService partnerService,
            IIRSequenceService sequenceService,
            IWorkContext workContext,
            IAsyncRepository<Payment> paymentRepository)
        {
            _orderService = orderService;
            _partnerService = partnerService;
            _sequenceService = sequenceService;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
        }

        public async Task<Guid> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;
            if (companyId == null)
                throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");

            // Validate Order - Load với PaymentOrders để tính toán chính xác
            var order = await _orderService.SearchQuery(o => o.Id == request.OrderId)
                .Include(o => o.OrderItems)
                .Include(o => o.PaymentOrders)
                .FirstOrDefaultAsync(cancellationToken);

            if (order == null)
                throw new UserFriendlyException("Đơn hàng không tồn tại.", "ORDER_NOT_FOUND");

            if (order.CompanyId != companyId)
                throw new UserFriendlyException("Đơn hàng không thuộc cửa hàng này.", "ORDER_COMPANY_MISMATCH");

            // Validate Partner
            var partner = await _partnerService.GetByIdAsync(request.PartnerId);
            if (partner == null)
                throw new UserFriendlyException("Khách hàng không tồn tại.", "PARTNER_NOT_FOUND");

            if (partner.CompanyId != companyId)
                throw new UserFriendlyException("Khách hàng không thuộc cửa hàng này.", "PARTNER_COMPANY_MISMATCH");

            // Validate số tiền thanh toán
            if (request.Amount <= 0)
                throw new UserFriendlyException("Số tiền thanh toán phải lớn hơn 0.", "INVALID_AMOUNT");

            // Tính toán lại số tiền đã thanh toán và còn lại
            _orderService.ComputeAmountForOrder(order);

            // Validate số tiền còn lại
            if (order.Residual <= 0)
                throw new UserFriendlyException("Đơn hàng đã được thanh toán đủ.", "ORDER_ALREADY_PAID");

            // Tính số tiền được phân bổ (không được vượt quá số tiền còn lại)
            var amountAllocated = Math.Min(order.Residual, request.Amount);

            // Tạo mã thanh toán từ sequence
            var paymentCode = await _sequenceService.GetNextRefAsync("Payment", companyId.Value);

            // Tạo Payment
            var payment = new Payment
            {
                PaymentCode = paymentCode,
                Amount = request.Amount,
                CompanyId = companyId,
                PaymentMethod = request.PaymentMethod,
                PartnerId = request.PartnerId,
                PaymentDate = request.PaymentDate,
                Note = request.Note
            };

            // Tạo PaymentOrder để liên kết Payment với Order
            var paymentOrder = new PaymentOrder
            {
                OrderId = order.Id,
                PaymentId = payment.Id,
                AmountAllocated = amountAllocated,
                CompanyId = companyId
            };

            payment.PaymentOrders.Add(paymentOrder);
            order.PaymentOrders.Add(paymentOrder);

            // Tính toán lại số tiền đã thanh toán và còn lại của Order
            _orderService.ComputeAmountForOrder(order);

            // Cập nhật PaymentStatus
            order.PaymentStatus = order.Residual == 0 ? "paid" : "partially_paid";

            // Lưu Payment và cập nhật Order
            await _paymentRepository.InsertAsync(payment);
            await _orderService.UpdateAsync(order);

            return payment.Id;
        }
    }
}


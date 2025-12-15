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
        public  Guid PartnerId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
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

            // Validate Order - Load với OrderItems để tính toán chính xác
            var order = await _orderService.SearchQuery(o => o.Id == request.OrderId)
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(cancellationToken);

            if (order == null)
                throw new UserFriendlyException("Đơn hàng không tồn tại.", "ORDER_NOT_FOUND");

            if (order.CompanyId != companyId)
                throw new UserFriendlyException("Đơn hàng không thuộc cửa hàng này.", "ORDER_COMPANY_MISMATCH");

            // Validate số tiền thanh toán
            if (request.Amount <= 0)
                throw new UserFriendlyException("Số tiền thanh toán phải lớn hơn 0.", "INVALID_AMOUNT");


            var sequence = await _sequenceService.GetNextRefAsync("Payment", companyId!.Value);
            var payment = new Payment
            {
                Amount = request.Amount,
                CompanyId = companyId,
                PaymentMethod = request.PaymentMethod,
                PartnerId = request.PartnerId,
                PaymentDate = request.PaymentDate,
            };

            var allocate = Math.Min(order.Residual, request.Amount);

            var paymentOrder = new PaymentOrder
            {
                OrderId = order.Id,
                PaymentId = payment.Id,
                AmountAllocated = allocate,
            };
            payment.PaymentOrders.Add(paymentOrder);


            // === 5. Update Order ===
            order.PaidAmount += allocate;
            order.Residual -= allocate;

            order.PaymentStatus = order.Residual == 0 ? "partially_paid" : "paid";

            await _orderService.UpdateAsync(order);
            await _paymentRepository.InsertAsync(payment);

            return order.Id;
        }
    }
}


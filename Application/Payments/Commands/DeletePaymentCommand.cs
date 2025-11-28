using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Payments.Commands
{
    public class DeletePaymentCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeletePaymentCommandHandler : IRequestHandler<DeletePaymentCommand, Unit>
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<Payment> _paymentRepository;

        public DeletePaymentCommandHandler(
            IPaymentService paymentService,
            IOrderService orderService,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext,
            IAsyncRepository<Payment> paymentRepository)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
        }

        public async Task<Unit> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
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

            // Lấy Payment
            var payment = await _paymentService.GetByIdAsync(request.Id);
            if (payment == null)
                throw new UserFriendlyException("Thanh toán không tồn tại.", "PAYMENT_NOT_FOUND");

            // Kiểm tra quyền truy cập theo CompanyId
            if (payment.CompanyId != companyId)
                throw new UserFriendlyException("Bạn không có quyền xóa thanh toán này.", "PAYMENT_ACCESS_DENIED");

            // Xóa Payment
            await _paymentService.DeleteAsync(payment);

            // Cập nhật PaymentStatus của Order
            if (payment.OrderId.HasValue)
            {
                var order = await _orderService.GetByIdAsync(payment.OrderId.Value);
                if (order != null)
                {
                    // Tính lại tổng tiền đã thanh toán
                    var paidAmount = await _paymentRepository.Table
                        .Where(p => p.OrderId == payment.OrderId && p.Id != payment.Id)
                        .SumAsync(p => (decimal?)p.Amount) ?? 0;

                    var orderTotal = order.OrderItems?.Sum(oi => oi.TotalPrice) ?? order.TotalPrice;
                    var remainingAmount = orderTotal - paidAmount;

                    if (paidAmount <= 0)
                    {
                        order.PaymentStatus = "Unpaid";
                    }
                    else if (remainingAmount > 0)
                    {
                        order.PaymentStatus = "PartiallyPaid";
                    }
                    else
                    {
                        order.PaymentStatus = "Paid";
                    }

                    await _orderService.UpdateAsync(order);
                }
            }

            return Unit.Value;
        }
    }
}


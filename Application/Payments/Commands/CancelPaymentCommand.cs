using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Payments.Commands
{
    public class CancelPaymentCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string? Reason { get; set; }
    }

    public class CancelPaymentCommandHandler : IRequestHandler<CancelPaymentCommand, Unit>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentOrderService _paymentOrderService;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<Payment> _paymentRepository;

        public CancelPaymentCommandHandler(
            IOrderService orderService,
            IPaymentOrderService paymentOrderService,
            IWorkContext workContext,
            IAsyncRepository<Payment> paymentRepository)
        {
            _orderService = orderService;
            _paymentOrderService = paymentOrderService;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
        }

        public async Task<Unit> Handle(CancelPaymentCommand request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;
            if (companyId == null)
                throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");

            // Load Payment với PaymentOrders
            var payment = await _paymentRepository.GetByIdAsync(request.Id);
            if (payment == null)
                throw new UserFriendlyException("Thanh toán không tồn tại.", "PAYMENT_NOT_FOUND");

            // Validate Payment thuộc đúng Company
            if (payment.CompanyId != companyId)
                throw new UserFriendlyException("Bạn không có quyền hủy thanh toán này.", "PAYMENT_ACCESS_DENIED");

            // Load các PaymentOrder của Payment này
            var existingPaymentOrders = await _paymentOrderService.SearchQuery(po => po.PaymentId == payment.Id)
                .ToListAsync(cancellationToken);

            // Kiểm tra Payment đã bị hủy chưa (kiểm tra xem có PaymentOrder nào có AmountAllocated âm không)
            var hasNegativeAllocation = existingPaymentOrders.Any(po => po.AmountAllocated < 0);
            if (hasNegativeAllocation)
                throw new UserFriendlyException("Thanh toán này đã được hủy trước đó.", "PAYMENT_ALREADY_CANCELLED");

            // Load các PaymentOrder dương (chưa bị rollback) để rollback
            var positivePaymentOrders = existingPaymentOrders
                .Where(po => po.AmountAllocated > 0)
                .ToList();

            if (!positivePaymentOrders.Any())
                throw new UserFriendlyException("Không có thanh toán nào để hủy.", "NO_PAYMENT_TO_CANCEL");

            // Lấy danh sách OrderId duy nhất
            var orderIds = positivePaymentOrders
                .Select(po => po.OrderId)
                .Distinct()
                .ToList();

            // Load các Order với đầy đủ PaymentOrders và OrderItems
            var ordersToUpdate = new Dictionary<Guid, Order>();
            foreach (var orderId in orderIds)
            {
                var order = await _orderService.SearchQuery(o => o.Id == orderId)
                    .Include(o => o.OrderItems)
                    .Include(o => o.PaymentOrders)
                    .FirstOrDefaultAsync(cancellationToken);

                if (order == null)
                    continue;

                // Validate Order thuộc đúng Company
                if (order.CompanyId != companyId)
                    throw new UserFriendlyException($"Đơn hàng {order.Code} không thuộc cửa hàng này.", "ORDER_COMPANY_MISMATCH");

                ordersToUpdate[orderId] = order;
            }

            // Rollback bằng cách tạo PaymentOrder với AmountAllocated âm (chuẩn ERP)
            var rollbackPaymentOrders = new List<PaymentOrder>();
            foreach (var order in ordersToUpdate.Values)
            {
                var paymentOrdersToRollback = positivePaymentOrders
                    .Where(po => po.OrderId == order.Id)
                    .ToList();

                foreach (var po in paymentOrdersToRollback)
                {
                    // Tạo PaymentOrder với AmountAllocated âm để rollback
                    var rollbackPaymentOrder = new PaymentOrder
                    {
                        OrderId = order.Id,
                        PaymentId = payment.Id,
                        AmountAllocated = -po.AmountAllocated,
                        CompanyId = companyId
                    };

                    rollbackPaymentOrders.Add(rollbackPaymentOrder);
                    order.PaymentOrders.Add(rollbackPaymentOrder);
                }

                // Tính lại số tiền đã thanh toán và còn lại
                _orderService.ComputeAmountForOrder(order);

                // Cập nhật PaymentStatus
                if (order.Residual <= 0)
                {
                    order.PaymentStatus = "paid";
                }
                else if (order.PaidAmount > 0)
                {
                    order.PaymentStatus = "partially_paid";
                }
                else
                {
                    order.PaymentStatus = "unpaid";
                }
            }

            // Lưu các PaymentOrder rollback
            if (rollbackPaymentOrders.Any())
            {
                await _paymentOrderService.CreateAsync(rollbackPaymentOrders);
            }

            // Cập nhật Note của Payment để ghi lại lý do hủy
            if (!string.IsNullOrWhiteSpace(request.Reason))
            {
                var currentNote = string.IsNullOrWhiteSpace(payment.Note) ? "" : payment.Note + "\n";
                payment.Note = $"{currentNote}[Hủy: {DateTime.Now:yyyy-MM-dd HH:mm:ss}] {request.Reason}";
                await _paymentRepository.UpdateAsync(payment);
            }

            // Cập nhật các Order
            if (ordersToUpdate.Any())
            {
                await _orderService.UpdateAsync(ordersToUpdate.Values);
            }

            return Unit.Value;
        }
    }
}


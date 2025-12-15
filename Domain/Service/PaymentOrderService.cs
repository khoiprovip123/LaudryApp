using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class PaymentOrderService : BaseService<PaymentOrder>, IPaymentOrderService
    {
        private readonly IOrderService _orderService;
        public PaymentOrderService(IAsyncRepository<PaymentOrder> repository, IHttpContextAccessor httpContextAccessor, IOrderService orderService) : base(repository, httpContextAccessor)
        {
            _orderService = orderService;
        }

        public void RollbackPayment(Order order, IEnumerable<PaymentOrder> paymentOrders)
        {
            if (order == null || paymentOrders == null)
                return;

            foreach (var po in paymentOrders)
            {
                // đảo số tiền (chuẩn ERP)
                order.PaymentOrders.Add(new PaymentOrder
                {
                    OrderId = order.Id,
                    PaymentId = po.PaymentId,
                    AmountAllocated = -po.AmountAllocated,
                });
            }

            // Tính lại tiền đơn
            _orderService.ComputeAmountForOrder(order);
        }
    }
}

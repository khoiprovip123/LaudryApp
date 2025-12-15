using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class OrderService : BaseService<Order>, IOrderService
    {
        public OrderService(IAsyncRepository<Order> repository, IHttpContextAccessor httpContextAccessor)
            : base(repository, httpContextAccessor)
        {
        }

        public void ComputeAmountForOrder(Order order)
        {
            //// sô tiền đã thanh toán
            //var totalPaid = 0M;
            ////số tiền cần thanh toán
            //var totalAmount = 0M;
            ////số tiền đã xuất hóa đơn
            //var totalInvoiced = 0M;

            //foreach (var item in order.OrderItems)
            //{
            //    totalAmount += item.TotalPrice;
            //}
            //order.TotalPrice = totalAmount;
            //order.PaidAmount = totalPaid;
            //order.Residual = order.TotalPrice - order.PaidAmount;
            if (order == null) return;

            // Tổng tiền đơn
            order.TotalPrice = order.OrderItems?.Sum(x => x.TotalPrice) ?? 0;

            // Tổng tiền đã thanh toán (từ PaymentOrder)
            order.PaidAmount = order.PaymentOrders?
                .Sum(x => x.AmountAllocated) ?? 0;

            // Còn lại
            order.Residual = order.TotalPrice - order.PaidAmount;
        }

        public void ComputeAmountForOrderItems(IEnumerable<OrderItem> orderItems)
        {
            if (orderItems == null)
            {
                return;
            }

            foreach (var item in orderItems)
            {
                if (item.IsWeightBased && item.WeightInKg.HasValue)
                {
                    item.TotalPrice = item.UnitPrice * Convert.ToDecimal(item.WeightInKg.Value);
                }
                else
                {
                    item.TotalPrice = item.UnitPrice * item.Quantity;
                }
            }
        }

        public void RollbackPayment(Order order, IEnumerable<PaymentOrder> paymentOrders)
        {
            if (order == null || paymentOrders == null)
            {
                return;
            }
            foreach (var po in paymentOrders)
            {
                order.PaymentOrders.Add(new PaymentOrder
                {
                    OrderId = order.Id,
                    PaymentId = po.PaymentId,
                    AmountAllocated = -po.AmountAllocated,
                });
            }
            ComputeAmountForOrder(order);
        }

        public async override Task<Order> GetByIdAsync(object id)
        {
            var guidId = (Guid)id;
            return await SearchQuery(x => x.Id == guidId)
                .Include(x => x.OrderItems)
                .Include(x => x.PaymentOrders)
                .FirstOrDefaultAsync();
        }

        public override Task UpdateAsync(IEnumerable<Order> entities)
        {
            if (entities.Any(x => x.Residual < 0))
            {
                var wrongOrders = entities.Where(x => x.Residual < 0).ToList();
                throw new UserFriendlyException("Số tiền còn lại của phiếu không được phép âm, vui lòng kiểm tra lại số tiền thanh toán. " + String.Join(", ", wrongOrders.Select(x => x.Code)));
            }


            return base.UpdateAsync(entities);
        }
    }
}


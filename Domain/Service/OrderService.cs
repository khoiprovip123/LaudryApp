using Domain.Service;
using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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
            // sô tiền đã thanh toán
            var totalPaid = 0M;
            //số tiền cần thanh toán
            var totalAmount = 0M;
            //số tiền đã xuất hóa đơn
            var totalInvoiced = 0M;

            foreach (var item in order.OrderItems)
            {
                totalAmount += item.TotalPrice;
            }
            order.TotalPrice = totalAmount;
            order.PaidAmount = totalPaid;
            order.Residual = order.TotalPrice - order.PaidAmount;
        }

        public void ComputeAmountForOrderItems(IEnumerable<OrderItem> orderItems)
        {
            if(orderItems == null)
            {
                return;
            }

            foreach(var item in orderItems)
            {
                if(item.IsWeightBased && item.WeightInKg.HasValue)
                {
                    item.TotalPrice = item.UnitPrice * Convert.ToDecimal(item.WeightInKg.Value);
                }
                else
                {
                    item.TotalPrice = item.UnitPrice * item.Quantity;
                }
            }
        }

        public async override Task<Order>GetByIdAsync(object id)
        {
            var guidId = (Guid)id;
            return await SearchQuery(x => x.Id == guidId).Include(x => x.OrderItems).FirstOrDefaultAsync();
        }
    }
}


using Domain.Service;
using Domain.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public interface IOrderService : IBaseService<Order>
    {
         void ComputeAmountForOrder(Order order);
         void ComputeAmountForOrderItems(OrderItem order);
    }
}


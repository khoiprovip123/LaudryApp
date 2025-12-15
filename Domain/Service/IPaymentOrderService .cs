using Domain.Entity;
using Domain.Service;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public interface IPaymentOrderService : IBaseService<PaymentOrder>
    {
        void RollbackPayment(Order order, IEnumerable<PaymentOrder> paymentOrders);
    }
}


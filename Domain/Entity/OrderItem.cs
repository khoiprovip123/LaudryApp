using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class OrderItem : BaseEntity
    {
        public Guid ServiceId { get; private set; }
        public string ServiceName { get; private set; }
        public decimal UnitPrice { get; private set; } //On Kg
        public decimal Quantity { get; private set; }
        public decimal TotalPrice { get; set; }
        public Guid OrderId { get; set; }
        public Order Order { get; set; }
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }

        private OrderItem() { }


        public OrderItem(Guid serviceId, string serviceName, decimal unitPrice, decimal quantity)
        {
            ServiceId = serviceId;
            ServiceName = serviceName;
            UnitPrice = unitPrice;
            Quantity = quantity;
        }
    }
}

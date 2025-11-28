using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class OrderItem : BaseEntity
    {
        public string ServiceName { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Quantity { get; set; }
        public string UnitOfMeasure { get; set; } = ""; // Đơn vị tính: kg, cái, bộ, v.v.
        public bool IsWeightBased { get; set; }
        public float? WeightInKg { get; set; }
        public decimal TotalPrice { get; set; }
        public Guid OrderId { get; set; }
        public Order Order { get; set; }
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
        public Guid ServiceId { get; private set; }
        public Service Service { get; set; }

        private OrderItem() { }


        public OrderItem(Guid serviceId, string serviceName, decimal unitPrice, decimal quantity, string? unitOfMeasure, decimal totalPrice, bool isWeightBased, float weightInKg)
        {
            ServiceId = serviceId;
            ServiceName = serviceName;
            UnitPrice = unitPrice;
            Quantity = quantity;
            UnitOfMeasure = unitOfMeasure ?? null;
            TotalPrice = totalPrice;
            IsWeightBased = isWeightBased;
            WeightInKg = weightInKg;
        }
    }
}

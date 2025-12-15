using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class Order : BaseEntity, IAggregateRoot
    {
        public ICollection<OrderItem>? OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<PaymentOrder> PaymentOrders { get; set; } = new List<PaymentOrder>();

        public string Code { get; set; }
        public Guid? PartnerId { get; set; }
        public Partner Partner { get; set; }
        public string? AddressText { get; set; }

        public DateTime? RequestedPickupTime { get; set; }
        public DateTime? ReceivedTime { get; set; }

        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }

        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal Residual { get; set; }


        public string? Notes { get; set; }
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }

        public Order(string code, Guid? partnerId, string? addressText, DateTime? requestedPickupTime, DateTime? receivedTime, string? status, string? paymentStatus, string? notes)
        {
            Code = code;
            PartnerId = partnerId;
            AddressText = addressText;
            RequestedPickupTime = requestedPickupTime;
            ReceivedTime = receivedTime;
            Status = status;
            PaymentStatus = paymentStatus;
            Notes = notes;
        }
    }
}

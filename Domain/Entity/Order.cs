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
        public ICollection<OrderItem> OrderItem { get; set; } = new List<OrderItem>();

        public string Code { get; set; }
        public Guid? PartnerId { get; set; }
        public Partner Partner { get; set; }
        public string? AddressText { get; set; }
        public DateTime? RequestedPickupTime { get; set; }
        public DateTime? ReceivedTime { get; set; }
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public decimal TotalPrice { get; set; }
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }
        public string? Notes { get; set; }
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }

        public Order(string code, Guid? partnerId, string? addressText, DateTime? requestedPickupTime, DateTime? receivedTime, string? status, string? paymentStatus, decimal totalPrice, Guid? createdBy, Guid? updatedBy, string? notes)
        {
            Code = code;
            PartnerId = partnerId;
            AddressText = addressText;
            RequestedPickupTime = requestedPickupTime;
            ReceivedTime = receivedTime;
            Status = status;
            PaymentStatus = paymentStatus;
            TotalPrice = totalPrice;
            CreatedBy = createdBy;
            UpdatedBy = updatedBy;
            Notes = notes;
        }
    }
}

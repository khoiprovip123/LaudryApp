using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid? OrderId { get; set; }
        public string OrderCode { get; set; }
        public Guid? PartnerId { get; set; }
        public string PartnerName { get; set; }
        public string PartnerRef { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? Note { get; set; }
        public string PaymentCode { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}


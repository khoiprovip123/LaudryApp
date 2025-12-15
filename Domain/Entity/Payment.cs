using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class Payment : BaseEntity
    {
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
        public Guid? PartnerId { get; set; }
        public Partner Partner { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime? PaymentDate { get; set; }
        public string? Note { get; set; }
        public string PaymentCode { get; set; } = string.Empty;
        public ICollection<PaymentOrder> PaymentOrders { get; set; } = new List<PaymentOrder>();
    }
}

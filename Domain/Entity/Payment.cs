using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Domain.Entity
{
    public class Payment : BaseEntity
    {
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
        public Guid? PartnerId { get; set; }
        public Partner Partner { get; set; }
        public Guid? OrderId { get; private set; }
        public Order Order { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? Note { get; set; }
        public string PaymentCode { get; set; }
    }
}

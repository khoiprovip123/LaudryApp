using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public  class PaymentOrder : BaseEntity
    {
        public Guid PaymentId { get; set; }
        public Guid OrderId { get; set; }

        public decimal AmountAllocated { get; set; }

        public Payment Payment { get; set; }
        public Order Order { get; set; }
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
    }
}

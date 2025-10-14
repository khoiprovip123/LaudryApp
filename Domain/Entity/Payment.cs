using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Domain.Entity
{
    public class Payment : BaseEntity<Guid>
    {
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
        public Guid? CustomerId { get; set; }
        public Customer Customer { get; set; }
        public Guid? OrderId { get; private set; }
        public Order Order { get; set; }
    }
}

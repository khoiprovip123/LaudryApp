using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class Company : BaseEntity
    {
        public string CompanyName { get; set; }
        public string OwnerName { get; set; }
        public string Phone { get; set; }
        public DateTime SubscriptionStartDate { get; set; }
        public DateTime? PeriodLockDate { get; set; }
        public bool Active{ get; set; }

    }
}

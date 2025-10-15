using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class Customer : BaseEntity<Guid>
    {
        public Customer()
        {
            Active = true;
        }

        public string Name { get; set; }
        public string Phone { get; set; }
        public string? Notes { get; set; }
        public string? Address { get; set; }
        public string? CityCode { get; set; }
        public string? CityName { get; set; }
        public string? DistrictCode { get; set; }
        public string? DistrictName { get; set; }
        public string? WardCode { get; set; }
        public string? WardName { get; set; }
        public bool Active { get; set; }
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
    }
}

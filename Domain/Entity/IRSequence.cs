using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class IRSequence : BaseEntity
    {
        public string Code { get; set; } = default!;
        public string Prefix { get; set; } = default!;
        public int Padding { get; set; } = 5;
        public int NumberNext { get; set; } = 1;
        public int NumberIncrement { get; set; } = 1;
        public string Implementation { get; set; } = "no_gap";

        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
    }
}

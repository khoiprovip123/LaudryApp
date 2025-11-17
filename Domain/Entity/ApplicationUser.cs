using Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Domain.Entity
{
    public class ApplicationUser : IdentityUser<Guid>, IEntity<Guid>
    {
        public ApplicationUser()
        {
            Active = true;
        }
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
        public Guid? PartnerId { get; set; }
        public Partner Partner { get; set; }
        public bool IsUserRoot { get; set; } // Chủ cửa hàng (Owner) - có toàn quyền trong cửa hàng của mình
        public bool Active { get; set; }
		public bool IsSuperAdmin { get; set; } = false;

    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.Caching;
public class ApplicationUserDto
{
    public string Id { get; set; }

    public string Name { get; set; }

    public string UserName { get; set; }

    public Guid PartnerId { get; set; }

    public Guid CompanyId { get; set; }

    public bool Active { get; set; }

    public bool IsUserRoot { get; set; }

    public string PasswordHash { get; set; }

    public string TenantId { get; set; }

    public bool CompanyIsUnrestricted { get; set; }

    public IEnumerable<Guid> AllowedCompanyIds { get; set; } = new List<Guid>();

    public IEnumerable<Guid> GroupIds { get; set; } = new List<Guid>();
    public IEnumerable<string> Rules { get; set; }
    public IEnumerable<Guid> RuleIds { get; set; }
    public IEnumerable<string> Roles { get; set; }
    public Guid? TeamId { get; set; }
    public bool TotpEnabled { get; set; }
}

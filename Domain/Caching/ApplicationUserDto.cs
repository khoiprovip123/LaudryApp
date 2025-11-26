using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Caching;

public class ApplicationUserDto
{
    public string Id { get; set; }

    public string Name { get; set; }

    public string UserName { get; set; }

    public Guid? PartnerId { get; set; }

    public Guid? CompanyId { get; set; }

    public bool Active { get; set; }

    public bool IsUserRoot { get; set; }
}


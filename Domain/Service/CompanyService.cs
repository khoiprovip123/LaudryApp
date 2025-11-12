using Application.Service;
using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class CompanyService : BaseService<Company>, ICompanyService
    {
        public CompanyService(IAsyncRepository<Company> repository, IHttpContextAccessor httpContextAccessor) : base(repository, httpContextAccessor)
        {
        }
    }
}

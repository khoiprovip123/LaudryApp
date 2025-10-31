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
    public class PartnerService : BaseService<Partner>, IParnerService
    {
        public PartnerService(IAsyncRepository<Partner> repository, IHttpContextAccessor httpContextAccessor) : base(repository, httpContextAccessor)
        {
        }
    }
}

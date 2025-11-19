using Domain.Service;
using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Domain.Service
{
    public class ServiceService : BaseService<Domain.Entity.Service>, IServiceService
    {
        public ServiceService(IAsyncRepository<Domain.Entity.Service> repository, IHttpContextAccessor httpContextAccessor) 
            : base(repository, httpContextAccessor)
        {
        }
    }
}


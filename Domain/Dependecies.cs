using Domain.Service;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public static class Dependecies
    {
        public static void ConfigureDomainServices(this IServiceCollection services, IConfiguration configuration = null)
        {
            services.AddScoped<IParnerService, PartnerService>();
        }
    }
}

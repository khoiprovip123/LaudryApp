using Domain;
using Domain.Interfaces;
using Domain.Service;
using Infrastucture.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastucture
{
    public static class Dependencies
    {
        public static void ConfigureInfraServices(this IServiceCollection services, IConfiguration configuration = null)
        {
            services.AddScoped(typeof(IAsyncRepository<>), typeof(EfRepository<>));
            services.AddScoped<ICatalogDbContextMigrationService, LaundryDbContextMigrationService>();
        }
    }
}

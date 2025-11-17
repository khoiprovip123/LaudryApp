using Domain.Interfaces;
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
    public static class Dependencies
    {
        public static void ConfigureDomainServices(this IServiceCollection services, IConfiguration? configuration = null)
        {
            services.AddScoped<IPartnerService, PartnerService>();
            services.AddScoped<ICompanyService, CompanyService>();
			services.AddScoped<IIRSequenceService, IRSequenceService>();
			services.AddScoped<IServiceService, ServiceService>();
			services.AddScoped<IPermissionGroupService, PermissionGroupService>();
			
			// Đăng ký WorkContext để quản lý IServiceProvider và ICurrentUser
			services.AddScoped<IWorkContext, WorkContext>();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using LHK.Security.Users;
using LHK.Security.Claims;

namespace LHK.Security;
public static class AbpSecurityServiceCollectionExtensions
{
    public static void AddUsersServices(this IServiceCollection services)
    {
        // IHttpContextAccessor sẽ được đăng ký trong Program.cs của API project
        // Ở đây chỉ đăng ký các services của Security
        
        // Đăng ký ICurrentPrincipalAccessor trước (dependency của CurrentUser)
        services.AddScoped<ICurrentPrincipalAccessor, CurrentPrincipalAccessor>();
        
        // Đăng ký ICurrentUser
        services.AddScoped<ICurrentUser, CurrentUser>();
    }
}

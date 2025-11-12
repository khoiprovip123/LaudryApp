using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace LHK.Security.Claims;

public class AbpClaimsPrincipalFactory : IAbpClaimsPrincipalFactory
{
    public static string AuthenticationType => "Abp.Application";

    public AbpClaimsPrincipalFactory()
    {
    }

    public virtual Task<ClaimsPrincipal> CreateAsync(ClaimsPrincipal existsClaimsPrincipal = null)
    {
        var claimsPrincipal = existsClaimsPrincipal ?? new ClaimsPrincipal(new ClaimsIdentity(
                AuthenticationType,
                AbpClaimTypes.UserName,
                AbpClaimTypes.Role));

        return Task.FromResult(claimsPrincipal);
    }
}

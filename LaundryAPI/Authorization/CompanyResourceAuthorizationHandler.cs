using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace LaundryAPI.Authorization
{
    /// <summary>
    /// Authorization handler để kiểm tra quyền truy cập resource Company
    /// User chỉ có thể truy cập Company của chính họ (trừ SuperAdmin)
    /// </summary>
    public class CompanyResourceAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, Company>
    {
        private readonly IWorkContext _workContext;

        public CompanyResourceAuthorizationHandler(IWorkContext workContext)
        {
            _workContext = workContext;
        }

        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            OperationAuthorizationRequirement requirement,
            Company resource)
        {
            var userCompanyId = _workContext.CompanyId;
            var isSuperAdmin = context.User.HasClaim("is_super_admin", "true");

            // Super admin có thể truy cập tất cả
            if (isSuperAdmin)
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // User chỉ có thể truy cập company của mình
            if (userCompanyId == resource.Id)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }

            return Task.CompletedTask;
        }
    }
}


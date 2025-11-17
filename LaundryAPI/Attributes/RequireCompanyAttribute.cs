using Domain.Interfaces;
using LHK.Share.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LaundryAPI.Attributes
{
    /// <summary>
    /// Attribute để yêu cầu user phải thuộc về một company để truy cập endpoint
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequireCompanyAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var workContext = context.HttpContext.RequestServices.GetRequiredService<IWorkContext>();
            var companyId = workContext.CompanyId;

            if (workContext.IsSuperAdmin)
            {
                await next();
                return;
            }

            if (companyId == null)
            {
                throw new UserFriendlyException("Bạn không thuộc chi nhanh này.", "COMPANY_NOT_FOUND");
            }

            await next();
        }
    }
}


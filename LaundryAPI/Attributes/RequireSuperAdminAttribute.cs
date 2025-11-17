using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LaundryAPI.Attributes
{
    /// <summary>
    /// Attribute để yêu cầu SuperAdmin để truy cập endpoint
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class RequireSuperAdminAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    error = "UNAUTHORIZED",
                    message = "Bạn cần đăng nhập để thực hiện thao tác này"
                });
                return;
            }

            // Kiểm tra SuperAdmin
            var isSuperAdmin = user.HasClaim("is_super_admin", "true");
            if (!isSuperAdmin)
            {
                context.Result = new ObjectResult(new
                {
                    error = "FORBIDDEN",
                    message = "Chỉ SuperAdmin mới có quyền truy cập chức năng này"
                })
                {
                    StatusCode = 403
                };
            }
        }
    }
}


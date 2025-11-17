using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LaundryAPI.Attributes
{
    /// <summary>
    /// Attribute để yêu cầu permission cụ thể để truy cập endpoint
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _permission;

        public RequirePermissionAttribute(string permission)
        {
            _permission = permission ?? throw new ArgumentNullException(nameof(permission));
        }

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

            // Super admin có tất cả permissions
            var isSuperAdmin = user.HasClaim("is_super_admin", "true");
            if (isSuperAdmin)
                return;

            // IsUserRoot (UserRoot) có tất cả permissions trong cửa hàng của mình
            var isUserRoot = user.HasClaim("is_user_root", "true");
            if (isUserRoot)
                return;

            // Kiểm tra permission trong claims
            var hasPermission = user.HasClaim("permission", _permission);
            if (!hasPermission)
            {
                context.Result = new ObjectResult(new
                {
                    error = "FORBIDDEN",
                    message = $"Bạn không có quyền thực hiện thao tác này. Yêu cầu permission: {_permission}"
                })
                {
                    StatusCode = 403
                };
            }
        }
    }
}


using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LaundryAPI.Attributes
{
    /// <summary>
    /// Attribute để yêu cầu role cụ thể để truy cập endpoint
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class RequireRoleAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _roles;

        public RequireRoleAttribute(params string[] roles)
        {
            _roles = roles ?? throw new ArgumentNullException(nameof(roles));
            if (_roles.Length == 0)
                throw new ArgumentException("Phải chỉ định ít nhất một role", nameof(roles));
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

            // Super admin có tất cả roles
            var isSuperAdmin = user.HasClaim("is_super_admin", "true");
            if (isSuperAdmin)
                return;

            // IsUserRoot (UserRoot) có tất cả roles trong cửa hàng của mình
            var isUserRoot = user.HasClaim("is_user_root", "true");
            if (isUserRoot)
                return;

            var hasRole = _roles.Any(role => user.IsInRole(role));
            if (!hasRole)
            {
                context.Result = new ObjectResult(new
                {
                    error = "FORBIDDEN",
                    message = $"Bạn không có quyền truy cập. Yêu cầu một trong các roles: {string.Join(", ", _roles)}"
                })
                {
                    StatusCode = 403
                };
            }
        }
    }
}


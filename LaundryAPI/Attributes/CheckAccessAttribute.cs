using Domain.Service;
using LaundryAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LaundryAPI.Attributes
{
    /// <summary>
    /// Attribute để kiểm tra quyền truy cập từ database thông qua PermissionGroup
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class CheckAccessAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        /// <summary>
        /// Danh sách permissions cần kiểm tra (phân tách bằng dấu phẩy)
        /// </summary>
        public string? Actions { get; set; }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            // Nếu user id null thì unauthorize
            if (context.HttpContext.User.Identity == null || !context.HttpContext.User.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedObjectResult(new ErrorResponse
                {
                    Error = new ErrorInfo
                    {
                        Code = "UNAUTHORIZED",
                        Message = "Bạn cần đăng nhập để thực hiện thao tác này"
                    },
                    UnauthorizedRequest = true,
                    Success = false
                });
                return;
            }

            // Nếu không có Actions được chỉ định, chỉ cần authenticated
            if (string.IsNullOrWhiteSpace(Actions))
            {
                return;
            }

            // Lấy ra danh sách những permission của user
            var permissionGroupService = context.HttpContext.RequestServices.GetService(typeof(IPermissionGroupService)) as IPermissionGroupService;
            
            if (permissionGroupService == null)
            {
                context.Result = new ObjectResult(new ErrorResponse
                {
                    Error = new ErrorInfo
                    {
                        Code = "INTERNAL_ERROR",
                        Message = "Không thể khởi tạo service kiểm tra quyền"
                    },
                    Success = false
                })
                {
                    StatusCode = 500
                };
                return;
            }

            // Lấy UserId từ claims
            var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrWhiteSpace(userIdClaim.Value))
            {
                context.Result = new UnauthorizedObjectResult(new ErrorResponse
                {
                    Error = new ErrorInfo
                    {
                        Code = "UNAUTHORIZED",
                        Message = "Không thể xác định thông tin người dùng"
                    },
                    UnauthorizedRequest = true,
                    Success = false
                });
                return;
            }

            // Phân tách danh sách permissions
            var permissions = Actions.Split(',')
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrEmpty(p))
                .ToArray();

            if (permissions.Length == 0)
            {
                return;
            }

            // Kiểm tra quyền truy cập
            var accessResult = await permissionGroupService.HasAccess(userIdClaim.Value, permissions);

            if (!accessResult.Access)
            {
                var errorResponse = new ErrorResponse
                {
                    Error = new ErrorInfo
                    {
                        Code = "FORBIDDEN",
                        Message = accessResult.Error
                    },
                    Success = false
                };

                var result = new ObjectResult(errorResponse)
                {
                    StatusCode = 403
                };

                context.Result = result;
            }
        }
    }
}


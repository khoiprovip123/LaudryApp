using Application.DTOs;
using Domain.Constants;
using MediatR;

namespace Application.Roles.Queries
{
    public class GetAllPermissionsQuery : IRequest<List<PermissionDto>>
    {
    }

    public class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, List<PermissionDto>>
    {
        public Task<List<PermissionDto>> Handle(GetAllPermissionsQuery request, CancellationToken cancellationToken)
        {
            var permissions = new List<PermissionDto>
            {
                // Companies
                new PermissionDto { Code = Permissions.Companies_View, Name = "Xem danh sách cửa hàng", Category = "Cửa hàng", Description = "Quyền xem danh sách các cửa hàng" },
                new PermissionDto { Code = Permissions.Companies_Create, Name = "Tạo cửa hàng", Category = "Cửa hàng", Description = "Quyền tạo cửa hàng mới" },
                new PermissionDto { Code = Permissions.Companies_Update, Name = "Cập nhật cửa hàng", Category = "Cửa hàng", Description = "Quyền cập nhật thông tin cửa hàng" },
                new PermissionDto { Code = Permissions.Companies_Delete, Name = "Xóa cửa hàng", Category = "Cửa hàng", Description = "Quyền xóa cửa hàng" },

                // Partners
                new PermissionDto { Code = Permissions.Partners_View, Name = "Xem danh sách khách hàng", Category = "Khách hàng", Description = "Quyền xem danh sách khách hàng" },
                new PermissionDto { Code = Permissions.Partners_Create, Name = "Tạo khách hàng", Category = "Khách hàng", Description = "Quyền tạo khách hàng mới" },
                new PermissionDto { Code = Permissions.Partners_Update, Name = "Cập nhật khách hàng", Category = "Khách hàng", Description = "Quyền cập nhật thông tin khách hàng" },
                new PermissionDto { Code = Permissions.Partners_Delete, Name = "Xóa khách hàng", Category = "Khách hàng", Description = "Quyền xóa khách hàng" },

                // Services
                new PermissionDto { Code = Permissions.Services_View, Name = "Xem danh sách dịch vụ", Category = "Dịch vụ", Description = "Quyền xem danh sách dịch vụ" },
                new PermissionDto { Code = Permissions.Services_Create, Name = "Tạo dịch vụ", Category = "Dịch vụ", Description = "Quyền tạo dịch vụ mới" },
                new PermissionDto { Code = Permissions.Services_Update, Name = "Cập nhật dịch vụ", Category = "Dịch vụ", Description = "Quyền cập nhật thông tin dịch vụ" },
                new PermissionDto { Code = Permissions.Services_Delete, Name = "Xóa dịch vụ", Category = "Dịch vụ", Description = "Quyền xóa dịch vụ" },

                // Orders
                new PermissionDto { Code = Permissions.Orders_View, Name = "Xem danh sách đơn hàng", Category = "Đơn hàng", Description = "Quyền xem danh sách đơn hàng" },
                new PermissionDto { Code = Permissions.Orders_Create, Name = "Tạo đơn hàng", Category = "Đơn hàng", Description = "Quyền tạo đơn hàng mới" },
                new PermissionDto { Code = Permissions.Orders_Update, Name = "Cập nhật đơn hàng", Category = "Đơn hàng", Description = "Quyền cập nhật thông tin đơn hàng" },
                new PermissionDto { Code = Permissions.Orders_Delete, Name = "Xóa đơn hàng", Category = "Đơn hàng", Description = "Quyền xóa đơn hàng" },

                // Payments
                new PermissionDto { Code = Permissions.Payments_View, Name = "Xem danh sách thanh toán", Category = "Thanh toán", Description = "Quyền xem danh sách thanh toán" },
                new PermissionDto { Code = Permissions.Payments_Create, Name = "Tạo thanh toán", Category = "Thanh toán", Description = "Quyền tạo thanh toán mới" },
                new PermissionDto { Code = Permissions.Payments_Update, Name = "Cập nhật thanh toán", Category = "Thanh toán", Description = "Quyền cập nhật thông tin thanh toán" },
                new PermissionDto { Code = Permissions.Payments_Delete, Name = "Xóa thanh toán", Category = "Thanh toán", Description = "Quyền xóa thanh toán" },
            };

            return Task.FromResult(permissions);
        }
    }
}


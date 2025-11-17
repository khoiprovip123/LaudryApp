using Application.DTOs;
using Domain.Constants;
using MediatR;
using System.Linq;
using RolesConstants = Domain.Constants.Roles;

namespace Application.Roles.Queries
{
    public class GetAllRolesQuery : IRequest<List<RoleDto>>
    {
    }

    public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, List<RoleDto>>
    {
        public Task<List<RoleDto>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
        {
            var roles = new List<RoleDto>
            {
                new RoleDto
                {
                    Name = RolesConstants.SuperAdmin,
                    DisplayName = "Super Admin",
                    Description = "Quản trị viên hệ thống - có tất cả quyền",
                    Permissions = RolesConstants.Permissions.SuperAdminPermissions.ToList()
                },
                new RoleDto
                {
                    Name = RolesConstants.UserRoot,
                    DisplayName = "Chủ cửa hàng",
                    Description = "Chủ cửa hàng - có toàn quyền trong cửa hàng của mình",
                    Permissions = RolesConstants.Permissions.UserRootPermissions.ToList()
                },
                new RoleDto
                {
                    Name = RolesConstants.Admin,
                    DisplayName = "Quản trị viên",
                    Description = "Quản trị viên cửa hàng - quản lý Partners và Services",
                    Permissions = RolesConstants.Permissions.AdminPermissions.ToList()
                },
                new RoleDto
                {
                    Name = RolesConstants.Manager,
                    DisplayName = "Quản lý",
                    Description = "Quản lý cửa hàng - quản lý Orders và xem Partners, Services",
                    Permissions = RolesConstants.Permissions.ManagerPermissions.ToList()
                },
                new RoleDto
                {
                    Name = RolesConstants.Employee,
                    DisplayName = "Nhân viên",
                    Description = "Nhân viên cửa hàng - xem Services và tạo Orders",
                    Permissions = RolesConstants.Permissions.EmployeePermissions.ToList()
                },
                new RoleDto
                {
                    Name = RolesConstants.Customer,
                    DisplayName = "Khách hàng",
                    Description = "Khách hàng - xem Services và tạo Orders",
                    Permissions = RolesConstants.Permissions.CustomerPermissions.ToList()
                },
            };

            return Task.FromResult(roles);
        }
    }
}


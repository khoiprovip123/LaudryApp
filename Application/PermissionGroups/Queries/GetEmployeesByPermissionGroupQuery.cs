using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Application.PermissionGroups.Queries
{
    public class GetEmployeesByPermissionGroupQuery : IRequest<List<EmployeeDto>>
    {
        public Guid PermissionGroupId { get; set; }
    }

    public class GetEmployeesByPermissionGroupQueryHandler : IRequestHandler<GetEmployeesByPermissionGroupQuery, List<EmployeeDto>>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public GetEmployeesByPermissionGroupQueryHandler(IPermissionGroupService permissionGroupService, IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<List<EmployeeDto>> Handle(GetEmployeesByPermissionGroupQuery request, CancellationToken cancellationToken)
        {
            var permissionGroup = await _permissionGroupService.GetByIdAsync(request.PermissionGroupId);

            if (permissionGroup == null)
                throw new Exception("Không tìm thấy nhóm quyền");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (permissionGroup.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xem nhân viên trong nhóm quyền này");
            }

            var employees = await _permissionGroupService.GetEmployeesByPermissionGroupIdAsync(request.PermissionGroupId);

            return employees.Select(e => new EmployeeDto
            {
                Id = e.Id,
                UserName = e.UserName ?? string.Empty,
                Email = e.Email ?? string.Empty,
                PhoneNumber = e.PhoneNumber ?? string.Empty,
                CompanyId = e.CompanyId,
                CompanyName = e.Company?.CompanyName ?? string.Empty,
                IsUserRoot = e.IsUserRoot,
                Active = e.Active,
                Roles = new List<string>() // Không còn roles nữa
            }).ToList();
        }
    }
}


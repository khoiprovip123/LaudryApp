using Application.DTOs;
using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.PermissionGroups.Queries
{
    public class GetPermissionGroupByIdQuery : IRequest<PermissionGroupDto>
    {
        public Guid Id { get; set; }
        public bool IncludeEmployees { get; set; } = true; // Mặc định include employees
    }

    public class GetPermissionGroupByIdQueryHandler : IRequestHandler<GetPermissionGroupByIdQuery, PermissionGroupDto>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<Domain.Entity.PermissionGroup> _repository;
        private readonly UserManager<ApplicationUser> _userManager;

        public GetPermissionGroupByIdQueryHandler(
            IPermissionGroupService permissionGroupService, 
            IWorkContext workContext,
            IAsyncRepository<Domain.Entity.PermissionGroup> repository,
            UserManager<ApplicationUser> userManager)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
            _repository = repository;
            _userManager = userManager;
        }

        public async Task<PermissionGroupDto> Handle(GetPermissionGroupByIdQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.SearchQuery(g => g.Id == request.Id)
                .Include(g => g.Company)
                .Include(g => g.EmployeePermissionGroups)
                    .ThenInclude(epg => epg.Employee)
                        .ThenInclude(e => e.Company)
                .AsNoTracking();

            var permissionGroup = await query.FirstOrDefaultAsync(cancellationToken);

            if (permissionGroup == null)
                throw new Exception("Không tìm thấy nhóm quyền");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (permissionGroup.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xem nhóm quyền này");
            }

            var permissions = string.IsNullOrEmpty(permissionGroup.Permissions)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(permissionGroup.Permissions) ?? new List<string>();

            var dto = new PermissionGroupDto
            {
                Id = permissionGroup.Id,
                Name = permissionGroup.Name,
                Description = permissionGroup.Description,
                CompanyId = permissionGroup.CompanyId,
                CompanyName = permissionGroup.Company?.CompanyName ?? string.Empty,
                Permissions = permissions,
                Active = permissionGroup.Active,
                EmployeeCount = permissionGroup.EmployeePermissionGroups.Count
            };

            // Nếu yêu cầu include employees, lấy danh sách nhân viên
            if (request.IncludeEmployees && permissionGroup.EmployeePermissionGroups.Any())
            {
                var employees = new List<EmployeeDto>();
                foreach (var epg in permissionGroup.EmployeePermissionGroups)
                {
                    var employee = epg.Employee;
                    if (employee != null)
                    {
                        var roles = await _userManager.GetRolesAsync(employee);
                        employees.Add(new EmployeeDto
                        {
                            Id = employee.Id,
                            UserName = employee.UserName ?? string.Empty,
                            Email = employee.Email ?? string.Empty,
                            PhoneNumber = employee.PhoneNumber ?? string.Empty,
                            CompanyId = employee.CompanyId,
                            CompanyName = employee.Company?.CompanyName ?? string.Empty,
                            IsUserRoot = employee.IsUserRoot,
                            Active = employee.Active,
                            Roles = roles.ToList()
                        });
                    }
                }
                dto.Employees = employees;
            }

            return dto;
        }
    }
}


using Application.Service;
using Domain.Entity;
using Domain.Helpers;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class PermissionGroupService : BaseService<PermissionGroup>, IPermissionGroupService
    {
        private readonly IAsyncRepository<PermissionGroup> _permissionGroupRepository;
        private readonly IAsyncRepository<EmployeePermissionGroup> _employeePermissionGroupRepository;
        private readonly IAsyncRepository<ApplicationUser> _userRepository;

        public PermissionGroupService(
            IAsyncRepository<PermissionGroup> repository,
            IAsyncRepository<EmployeePermissionGroup> employeePermissionGroupRepository,
            IAsyncRepository<ApplicationUser> userRepository,
            IHttpContextAccessor httpContextAccessor) 
            : base(repository, httpContextAccessor)
        {
            _permissionGroupRepository = repository;
            _employeePermissionGroupRepository = employeePermissionGroupRepository;
            _userRepository = userRepository;
        }

        public async Task<List<ApplicationUser>> GetEmployeesByPermissionGroupIdAsync(Guid permissionGroupId)
        {
            var employeeIds = await _employeePermissionGroupRepository
                .SearchQuery(epg => epg.PermissionGroupId == permissionGroupId)
                .Select(epg => epg.EmployeeId)
                .ToListAsync();

            if (!employeeIds.Any())
                return new List<ApplicationUser>();

            var employees = await _userRepository
                .SearchQuery(u => employeeIds.Contains(u.Id))
                .Include(u => u.Company)
                .ToListAsync();

            return employees;
        }

        public async Task AddEmployeesToPermissionGroupAsync(Guid permissionGroupId, List<Guid> employeeIds)
        {
            if (!employeeIds.Any())
                return;

            // Lấy danh sách nhân viên hiện có trong nhóm
            var existingEmployeeIds = await _employeePermissionGroupRepository
                .SearchQuery(epg => epg.PermissionGroupId == permissionGroupId)
                .Select(epg => epg.EmployeeId)
                .ToListAsync();

            // Lọc ra các nhân viên chưa có trong nhóm
            var newEmployeeIds = employeeIds
                .Where(id => !existingEmployeeIds.Contains(id))
                .ToList();

            if (!newEmployeeIds.Any())
                return;

            // Tạo các EmployeePermissionGroup mới
            var employeePermissionGroups = newEmployeeIds.Select(employeeId => new EmployeePermissionGroup
            {
                EmployeeId = employeeId,
                PermissionGroupId = permissionGroupId
            }).ToList();

            await _employeePermissionGroupRepository.InsertAsync(employeePermissionGroups, autoSave: false);
            await _employeePermissionGroupRepository.DbContext.SaveChangesAsync();
        }

        public async Task RemoveEmployeesFromPermissionGroupAsync(Guid permissionGroupId, List<Guid> employeeIds)
        {
            if (!employeeIds.Any())
                return;

            var employeePermissionGroups = await _employeePermissionGroupRepository
                .SearchQuery(epg => epg.PermissionGroupId == permissionGroupId 
                                 && employeeIds.Contains(epg.EmployeeId))
                .ToListAsync();

            if (!employeePermissionGroups.Any())
                return;

            await _employeePermissionGroupRepository.DeleteAsync(employeePermissionGroups, autoSave: false);
            await _employeePermissionGroupRepository.DbContext.SaveChangesAsync();
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? companyId, Guid? excludeId = null)
        {
            var query = _permissionGroupRepository.SearchQuery(pg => pg.Name == name && pg.CompanyId == companyId);
            
            if (excludeId.HasValue)
            {
                query = query.Where(pg => pg.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<List<ApplicationUser>> ValidateEmployeesBelongToCompanyAsync(List<Guid> employeeIds, Guid companyId)
        {
            if (!employeeIds.Any())
                return new List<ApplicationUser>();

            var employees = await _userRepository
                .SearchQuery(u => employeeIds.Contains(u.Id))
                .ToListAsync();

            return employees;
        }

        public async Task<PermissionList> GetPermissionGroupsByUserIdAsync(Guid userId)
        {
            var listPermissions = await _permissionGroupRepository
                .SearchQuery(pg => pg.EmployeePermissionGroups.Any(epg => epg.EmployeeId == userId))
                .Select(pg => pg.Permissions)
                .FirstOrDefaultAsync();

            return listPermissions ?? new PermissionList();
        }

        public async Task<List<string>> GetUserPermissionsAsync(Guid userId)
        {
            // Query từ PermissionGroup thông qua EmployeePermissionGroup để lấy tất cả permissions
            var permissionGroups = await _permissionGroupRepository
                .SearchQuery(pg => pg.Active && pg.EmployeePermissionGroups.Any(epg => epg.EmployeeId == userId))
                .ToListAsync();

            if (permissionGroups == null || !permissionGroups.Any())
                return new List<string>();

            // Lấy tất cả permissions từ các PermissionGroup mà user thuộc về
            var permissions = new List<string>();

            foreach (var pg in permissionGroups)
            {
                if (pg.Permissions != null && pg.Permissions.Items != null)
                {
                    permissions.AddRange(pg.Permissions.Items);
                }
            }

            // Loại bỏ duplicate và trả về
            return permissions.Distinct().ToList();
        }

        public async Task<AccessResult> HasAccess(Guid userId, string[] permissions)
        {
            if (permissions == null || permissions.Length == 0)
            {
                return new AccessResult
                {
                    Access = true,
                    Error = string.Empty
                };
            }

            // Lấy user để check SuperAdmin và UserRoot
            var user = await _userRepository
                .SearchQuery(u => u.Id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return new AccessResult
                {
                    Access = false,
                    Error = "Người dùng không tồn tại"
                };
            }

            // SuperAdmin có tất cả quyền
            if (user.IsSuperAdmin)
            {
                return new AccessResult
                {
                    Access = true,
                    Error = string.Empty
                };
            }

            // UserRoot có tất cả quyền trong cửa hàng của mình
            if (user.IsUserRoot)
            {
                return new AccessResult
                {
                    Access = true,
                    Error = string.Empty
                };
            }

            // Lấy permissions của user
            var userPermissions = await GetUserPermissionsAsync(userId);

            // Kiểm tra user có ít nhất một trong các permissions được yêu cầu không (OR logic)
            var hasPermission = permissions.Any(requiredPermission =>
                userPermissions.Contains(requiredPermission, StringComparer.OrdinalIgnoreCase));

            if (!hasPermission)
            {
                return new AccessResult
                {
                    Access = false,
                    Error = PermissionMessageHelper.FormatAccessDeniedMessage(permissions)
                };
            }

            return new AccessResult
            {
                Access = true,
                Error = string.Empty
            };
        }
    }
}


using Application.Service;
using Domain.Entity;
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
    }
}


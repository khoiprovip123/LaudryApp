using Application.Service;
using Domain.Entity;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Service
{
    public interface IPermissionGroupService : IBaseService<PermissionGroup>
    {
        /// <summary>
        /// Lấy danh sách nhân viên trong nhóm quyền
        /// </summary>
        Task<List<ApplicationUser>> GetEmployeesByPermissionGroupIdAsync(Guid permissionGroupId);

        /// <summary>
        /// Thêm nhân viên vào nhóm quyền
        /// </summary>
        Task AddEmployeesToPermissionGroupAsync(Guid permissionGroupId, List<Guid> employeeIds);

        /// <summary>
        /// Xóa nhân viên khỏi nhóm quyền
        /// </summary>
        Task RemoveEmployeesFromPermissionGroupAsync(Guid permissionGroupId, List<Guid> employeeIds);

        /// <summary>
        /// Kiểm tra tên nhóm quyền đã tồn tại trong công ty chưa
        /// </summary>
        Task<bool> IsNameExistsAsync(string name, Guid? companyId, Guid? excludeId = null);
    }
}


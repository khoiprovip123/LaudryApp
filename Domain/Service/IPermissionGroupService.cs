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

        /// <summary>
        /// Kiểm tra các nhân viên có thuộc cùng công ty không
        /// </summary>
        Task<List<ApplicationUser>> ValidateEmployeesBelongToCompanyAsync(List<Guid> employeeIds, Guid companyId);

        /// <summary>
        /// Lấy PermissionList của user từ PermissionGroup đầu tiên
        /// </summary>
        Task<PermissionList> GetPermissionGroupsByUserIdAsync(Guid userId);

        /// <summary>
        /// Lấy tất cả permissions của user từ các PermissionGroup
        /// </summary>
        Task<List<string>> GetUserPermissionsAsync(Guid userId);

        /// <summary>
        /// Kiểm tra user có quyền truy cập các actions được chỉ định không
        /// </summary>
        Task<AccessResult> HasAccess(Guid userId, string[] permissions);
    }

    /// <summary>
    /// Kết quả kiểm tra quyền truy cập
    /// </summary>
    public class AccessResult
    {
        public bool Access { get; set; }
        public string Error { get; set; } = string.Empty;
    }
}


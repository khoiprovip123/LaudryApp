using System;

namespace Domain.Entity
{
    /// <summary>
    /// Bảng trung gian liên kết Employee và PermissionGroup
    /// </summary>
    public class EmployeePermissionGroup : BaseEntity
    {
        /// <summary>
        /// ID nhân viên
        /// </summary>
        public string EmployeeId { get; set; }

        /// <summary>
        /// Nhân viên
        /// </summary>
        public ApplicationUser Employee { get; set; }

        /// <summary>
        /// ID nhóm quyền
        /// </summary>
        public Guid PermissionGroupId { get; set; }

        /// <summary>
        /// Nhóm quyền
        /// </summary>
        public PermissionGroup PermissionGroup { get; set; }
    }
}


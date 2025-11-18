using System;
using System.Collections.Generic;

namespace Domain.Entity
{
    public class PermissionGroup : BaseEntity
    {
        /// <summary>
        /// Tên nhóm quyền
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Mô tả nhóm quyền
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// ID công ty (null nếu là nhóm quyền hệ thống)
        /// </summary>
        public Guid? CompanyId { get; set; }

        /// <summary>
        /// Công ty sở hữu nhóm quyền
        /// </summary>
        public Company Company { get; set; }

        /// <summary>
        /// Danh sách mã quyền (permission codes)
        /// </summary>
        public PermissionList Permissions { get; set; } = new PermissionList(); // JSON array of permission codes

        /// <summary>
        /// Danh sách nhân viên trong nhóm quyền
        /// </summary>
        public ICollection<EmployeePermissionGroup> EmployeePermissionGroups { get; set; } = new List<EmployeePermissionGroup>();

        /// <summary>
        /// Trạng thái hoạt động
        /// </summary>
        public bool Active { get; set; } = true;
    }
}


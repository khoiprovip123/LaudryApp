using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PermissionGroupDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid? CompanyId { get; set; }
        public string CompanyName { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public bool Active { get; set; }
        public int EmployeeCount { get; set; }
        public List<EmployeeDto> Employees { get; set; } = new List<EmployeeDto>(); // Danh sách nhân viên trong nhóm quyền
    }
}


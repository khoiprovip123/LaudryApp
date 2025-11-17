namespace Application.DTOs
{
    public class PermissionDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
    }

    public class RoleDto
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }

    public class RolePermissionDto
    {
        public string RoleName { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }
}


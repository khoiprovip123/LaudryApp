using System.Collections.Generic;

namespace Domain.Entity
{
    /// <summary>
    /// Wrapper class cho danh sách permissions để sử dụng ToJson() trong EF Core
    /// </summary>
    public class PermissionList
    {
        public List<string> Items { get; set; } = new List<string>();
    }
}


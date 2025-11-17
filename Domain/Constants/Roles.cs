namespace Domain.Constants
{
    public static class Roles
    {
        public const string SuperAdmin = "SuperAdmin";
        public const string UserRoot = "UserRoot"; // Chủ cửa hàng - có toàn quyền trong cửa hàng của mình
        public const string Admin = "Admin";
        public const string Manager = "Manager";
        public const string Employee = "Employee";
        public const string Customer = "Customer";

        public static class Permissions
        {
            /// <summary>
            /// SuperAdmin có tất cả permissions
            /// </summary>
            public static readonly string[] SuperAdminPermissions = Domain.Constants.Permissions.GetAll();
            
            /// <summary>
            /// UserRoot (Chủ cửa hàng) có tất cả permissions trong cửa hàng của mình
            /// </summary>
            public static readonly string[] UserRootPermissions = Domain.Constants.Permissions.GetAll();
            
            /// <summary>
            /// Admin có quyền quản lý Partners và Services, chỉ xem Companies
            /// </summary>
            public static readonly string[] AdminPermissions = new[]
            {
                Domain.Constants.Permissions.Companies_View,
                Domain.Constants.Permissions.Partners_View,
                Domain.Constants.Permissions.Partners_Create,
                Domain.Constants.Permissions.Partners_Update,
                Domain.Constants.Permissions.Partners_Delete,
                Domain.Constants.Permissions.Services_View,
                Domain.Constants.Permissions.Services_Create,
                Domain.Constants.Permissions.Services_Update,
                Domain.Constants.Permissions.Services_Delete,
                Domain.Constants.Permissions.Orders_View,
                Domain.Constants.Permissions.Orders_Create,
                Domain.Constants.Permissions.Orders_Update,
                Domain.Constants.Permissions.Payments_View,
                Domain.Constants.Permissions.Payments_Create,
                Domain.Constants.Permissions.Payments_Update
            };

            /// <summary>
            /// Manager có quyền xem và quản lý Orders, Partners, Services
            /// </summary>
            public static readonly string[] ManagerPermissions = new[]
            {
                Domain.Constants.Permissions.Partners_View,
                Domain.Constants.Permissions.Services_View,
                Domain.Constants.Permissions.Orders_View,
                Domain.Constants.Permissions.Orders_Create,
                Domain.Constants.Permissions.Orders_Update,
                Domain.Constants.Permissions.Payments_View,
                Domain.Constants.Permissions.Payments_Create
            };

            /// <summary>
            /// Employee chỉ có quyền xem và tạo Orders, Services
            /// </summary>
            public static readonly string[] EmployeePermissions = new[]
            {
                Domain.Constants.Permissions.Services_View,
                Domain.Constants.Permissions.Orders_View,
                Domain.Constants.Permissions.Orders_Create,
                Domain.Constants.Permissions.Payments_View
            };

            /// <summary>
            /// Customer chỉ có quyền xem Services và tạo Orders
            /// </summary>
            public static readonly string[] CustomerPermissions = new[]
            {
                Domain.Constants.Permissions.Services_View,
                Domain.Constants.Permissions.Orders_View,
                Domain.Constants.Permissions.Orders_Create
            };
        }
    }
}


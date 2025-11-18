using System;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Helpers
{
    /// <summary>
    /// Helper class để format thông báo lỗi về quyền truy cập
    /// </summary>
    public static class PermissionMessageHelper
    {
        /// <summary>
        /// Format thông báo lỗi khi user không có quyền
        /// </summary>
        /// <param name="permissions">Danh sách permissions bị thiếu</param>
        /// <returns>Thông báo lỗi đã được format</returns>
        public static string FormatAccessDeniedMessage(string[] permissions)
        {
            if (permissions == null || permissions.Length == 0)
            {
                return "Bạn không có quyền thực hiện thao tác này";
            }

            // Lấy tên hiển thị của các permissions
            var permissionNames = permissions.Select(GetPermissionDisplayName).ToList();

            if (permissionNames.Count == 1)
            {
                return $"Bạn không có quyền {permissionNames.First()}";
            }

            // Nếu có nhiều permissions, format theo dạng: "Bạn không có quyền [Permission1] hoặc [Permission2]"
            var lastPermission = permissionNames.Last();
            var otherPermissions = permissionNames.Take(permissionNames.Count - 1);
            var permissionsList = string.Join(", ", otherPermissions);

            return $"Bạn không có quyền {permissionsList} hoặc {lastPermission}";
        }

        /// <summary>
        /// Lấy tên hiển thị của permission từ permission code
        /// </summary>
        /// <param name="permissionCode">Permission code (ví dụ: "Companies.View")</param>
        /// <returns>Tên hiển thị dễ đọc (ví dụ: "Xem công ty")</returns>
        private static string GetPermissionDisplayName(string permissionCode)
        {
            if (string.IsNullOrWhiteSpace(permissionCode))
                return permissionCode;

            // Dictionary mapping permission codes sang tên hiển thị
            // Có thể mở rộng thêm các permissions khác
            var permissionDisplayNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                // Company Permissions
                { "Companies.View", "Xem công ty" },
                { "Companies.Create", "Tạo công ty" },
                { "Companies.Update", "Cập nhật công ty" },
                { "Companies.Delete", "Xóa công ty" },

                // Partner Permissions
                { "Partners.View", "Xem đối tác" },
                { "Partners.Create", "Tạo đối tác" },
                { "Partners.Update", "Cập nhật đối tác" },
                { "Partners.Delete", "Xóa đối tác" },

                // Service Permissions
                { "Services.View", "Xem dịch vụ" },
                { "Services.Create", "Tạo dịch vụ" },
                { "Services.Update", "Cập nhật dịch vụ" },
                { "Services.Delete", "Xóa dịch vụ" },

                // Order Permissions
                { "Orders.View", "Xem đơn hàng" },
                { "Orders.Create", "Tạo đơn hàng" },
                { "Orders.Update", "Cập nhật đơn hàng" },
                { "Orders.Delete", "Xóa đơn hàng" },

                // Payment Permissions
                { "Payments.View", "Xem thanh toán" },
                { "Payments.Create", "Tạo thanh toán" },
                { "Payments.Update", "Cập nhật thanh toán" },
                { "Payments.Delete", "Xóa thanh toán" },
            };

            // Nếu có trong dictionary thì trả về tên hiển thị
            if (permissionDisplayNames.TryGetValue(permissionCode, out var displayName))
            {
                return displayName;
            }

            // Nếu không có, format từ permission code
            // Ví dụ: "Companies.View" -> "Companies View"
            return permissionCode.Replace(".", " ").Replace("_", " ");
        }
    }
}


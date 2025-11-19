namespace Domain.Constants
{
    public static class OrderStatus
    {
        /// <summary>
        /// Received - Đã nhận đồ
        /// Khách mang đồ đến. Nhân viên đã kiểm đồ, cân, ghi phiếu, tạo order.
        /// Chưa bắt đầu giặt. Đây là trạng thái khởi tạo (Initial State).
        /// </summary>
        public const string Received = "Received";

        /// <summary>
        /// Processing - Đang giặt
        /// Đồ đang trong quy trình: giặt → sấy → là ủi.
        /// </summary>
        public const string Processing = "Processing";

        /// <summary>
        /// Completed - Đã giặt xong
        /// Đồ đã hoàn tất: sạch – khô – đã gấp.
        /// Đang chờ khách đến lấy. Chưa thanh toán (nếu tiệm cho thanh toán khi nhận).
        /// </summary>
        public const string Completed = "Completed";

        /// <summary>
        /// Delivered - Đã giao cho khách
        /// Khách đến nhận đồ. Đã thanh toán (hoặc đã thu COD).
        /// Order được đóng lại.
        /// </summary>
        public const string Delivered = "Delivered";

        public static string[] GetAll()
        {
            return new[]
            {
                Received,
                Processing,
                Completed,
                Delivered
            };
        }

        public static bool IsValid(string status)
        {
            return GetAll().Contains(status);
        }
    }
}


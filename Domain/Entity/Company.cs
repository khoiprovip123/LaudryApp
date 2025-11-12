using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class Company : BaseEntity
    {
        /// <summary>
        /// Tên cửa hàng
        /// </summary>
        public string CompanyName { get; set; }
        /// <summary>
        /// Tên chủ sở hữu
        /// </summary>
        public string OwnerName { get; set; }
        public string Phone { get; set; }
        /// <summary>
        /// Ngày bắt đầu sử tạo và sử dụng dịch vụ
        /// </summary>
        public DateTime SubscriptionStartDate { get; set; }
        /// <summary>
        /// Ngày dự kiến hết hạn sử dụng dịch vụ
        /// </summary>
        public DateTime? PeriodLockDate { get; set; }
        public bool Active { get; set; }

    }
}

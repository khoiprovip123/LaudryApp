using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class Service : BaseEntity
    {
        public string Name { get; set; }
        public decimal UnitPrice { get; set; }
        public string UnitOfMeasure { get; set; } = "kg"; // Đơn vị tính: kg, cái, bộ, v.v.
        public bool IsWeightBased { get; set; } = false; // Tính trên kg hay không
        public decimal? MinimumWeight { get; set; } // Khối lượng tối thiểu (kg)
        public decimal? MinimumPrice { get; set; } // Giá tối thiểu (VNĐ) - tự động điền trên FE, có thể tùy chỉnh khi tạo order
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
        public bool Active { get; set; }
        public string Description{ get; set; }
        public string DefaultCode { get; set; }

    }
}

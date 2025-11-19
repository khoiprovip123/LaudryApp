using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entity
{
    public class PrintTemplate : BaseEntity
    {
        /// <summary>
        /// Tên template
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Loại template: "Receive" hoặc "Delivery"
        /// </summary>
        public string TemplateType { get; set; }

        /// <summary>
        /// HTML template với các placeholder như {{companyName}}, {{orderCode}}, etc.
        /// </summary>
        public string HtmlTemplate { get; set; }

        /// <summary>
        /// CSS styles cho template
        /// </summary>
        public string CssStyles { get; set; }

        /// <summary>
        /// Template có đang active không
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Template mặc định cho loại này
        /// </summary>
        public bool IsDefault { get; set; }

        /// <summary>
        /// Mô tả template
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Thuộc về công ty nào
        /// </summary>
        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }
    }
}


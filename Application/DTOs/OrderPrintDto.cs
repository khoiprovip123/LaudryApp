using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class OrderPrintDto
    {
        public Guid OrderId { get; set; }
        public string OrderCode { get; set; }
        public DateTime OrderDate { get; set; }
        public string PartnerName { get; set; }
        public string PartnerDisplayName { get; set; }
        public string PartnerPhone { get; set; }
        public string PartnerAddress { get; set; }
        public string CompanyName { get; set; }
        public string CompanyPhone { get; set; }
        public string CompanyAddress { get; set; }
        public List<OrderItemPrintDto> Items { get; set; } = new List<OrderItemPrintDto>();
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public string Notes { get; set; }
        public string PrintType { get; set; } // "Receive" hoặc "Delivery"
        
        // Thêm các field để dễ dàng render template
        public Dictionary<string, object> TemplateData { get; set; } = new Dictionary<string, object>();
    }

    public class OrderItemPrintDto
    {
        public string ServiceName { get; set; }
        public decimal Quantity { get; set; }
        public string UnitOfMeasure { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}

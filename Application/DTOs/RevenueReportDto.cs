using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class RevenueReportDto
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalDebt { get; set; }
        public List<RevenueByServiceDto> RevenueByService { get; set; } = new List<RevenueByServiceDto>();
        public List<RevenueByCustomerDto> RevenueByCustomer { get; set; } = new List<RevenueByCustomerDto>();
        public List<DailyRevenueDetailDto> DailyDetails { get; set; } = new List<DailyRevenueDetailDto>();
    }

    public class RevenueByServiceDto
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public decimal Quantity { get; set; }
    }

    public class RevenueByCustomerDto
    {
        public Guid PartnerId { get; set; }
        public string PartnerName { get; set; }
        public string PartnerDisplayName { get; set; }
        public decimal Revenue { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DebtAmount { get; set; }
        public int OrderCount { get; set; }
    }

    public class DailyRevenueDetailDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public int PaidOrders { get; set; }
        public int DebtOrders { get; set; }
    }
}


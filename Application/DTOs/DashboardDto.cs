using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class DashboardStatsDto
    {
        // Tổng quan
        public decimal TodayRevenue { get; set; }
        public decimal WeekRevenue { get; set; }
        public decimal MonthRevenue { get; set; }
        public decimal YearRevenue { get; set; }

        // Đơn hàng
        public int TodayOrders { get; set; }
        public int WeekOrders { get; set; }
        public int MonthOrders { get; set; }
        public int YearOrders { get; set; }

        // Trạng thái đơn hàng
        public int ReceivedOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int DeliveredOrders { get; set; }

        // Công nợ
        public decimal TotalDebt { get; set; }
        public int DebtOrders { get; set; }

        // Top khách hàng
        public List<TopCustomerDto> TopCustomers { get; set; } = new List<TopCustomerDto>();

        // Doanh thu theo ngày (7 ngày gần nhất)
        public List<DailyRevenueDto> DailyRevenues { get; set; } = new List<DailyRevenueDto>();

        // Đơn hàng quá hạn
        public int OverdueOrders { get; set; }
    }

    public class TopCustomerDto
    {
        public Guid PartnerId { get; set; }
        public string PartnerName { get; set; }
        public string PartnerDisplayName { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }
}


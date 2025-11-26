using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Dashboard.Queries
{
    public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }

    public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IPartnerService _partnerService;
        private readonly IWorkContext _workContext;

        public GetDashboardStatsQueryHandler(
            IOrderService orderService,
            IPaymentService paymentService,
            IPartnerService partnerService,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _partnerService = partnerService;
            _workContext = workContext;
        }

        public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;
            var isSuperAdmin = _workContext.IsSuperAdmin;

            if (companyId == null && !isSuperAdmin)
            {
                throw new Exception("Không xác định được cửa hàng của người dùng.");
            }

            var now = DateTime.Now;
            var today = now.Date;
            var weekStart = today.AddDays(-(int)today.DayOfWeek);
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var yearStart = new DateTime(today.Year, 1, 1);
            var tomorrowStart = today.AddDays(1);
            var overdueDate = today.AddDays(-3);

            var orders = _orderService.SearchQuery(o => o.CompanyId == companyId);
            var payments = _paymentService.SearchQuery(p => p.CompanyId == companyId);

            // Load data tuần tự để tránh lỗi DbContext thread-safety
            var paymentsList = await payments
                .Select(p => new { p.PaymentDate, p.Amount, p.OrderId })
                .ToListAsync(cancellationToken);

            var ordersList = await orders
                .Select(o => new { o.Id, o.DateCreated, o.Status, o.PartnerId, o.TotalPrice })
                .ToListAsync(cancellationToken);

            var orderItemsList = await orders
                .SelectMany(o => o.OrderItem.Select(oi => new { o.Id, oi.Quantity, oi.UnitPrice }))
                .ToListAsync(cancellationToken);

            // Tính toán doanh thu từ Payments trong memory
            var todayPayments = paymentsList.Where(p => p.PaymentDate.Date == today).Sum(p => p.Amount);
            var weekPayments = paymentsList.Where(p => p.PaymentDate >= weekStart && p.PaymentDate < tomorrowStart).Sum(p => p.Amount);
            var monthPayments = paymentsList.Where(p => p.PaymentDate >= monthStart && p.PaymentDate < tomorrowStart).Sum(p => p.Amount);
            var yearPayments = paymentsList.Where(p => p.PaymentDate >= yearStart && p.PaymentDate < tomorrowStart).Sum(p => p.Amount);

            // Đếm đơn hàng trong memory
            var todayOrders = ordersList.Count(o => o.DateCreated.Date == today);
            var weekOrders = ordersList.Count(o => o.DateCreated >= weekStart && o.DateCreated < tomorrowStart);
            var monthOrders = ordersList.Count(o => o.DateCreated >= monthStart && o.DateCreated < tomorrowStart);
            var yearOrders = ordersList.Count(o => o.DateCreated >= yearStart && o.DateCreated < tomorrowStart);

            // Đếm đơn hàng theo trạng thái trong memory
            var receivedOrders = ordersList.Count(o => o.Status == Domain.Constants.OrderStatus.Received);
            var processingOrders = ordersList.Count(o => o.Status == Domain.Constants.OrderStatus.Processing);
            var completedOrders = ordersList.Count(o => o.Status == Domain.Constants.OrderStatus.Completed);
            var deliveredOrders = ordersList.Count(o => o.Status == Domain.Constants.OrderStatus.Delivered);

            // Đơn hàng quá hạn
            var overdueOrders = ordersList.Count(o => o.Status == Domain.Constants.OrderStatus.Completed && o.DateCreated < overdueDate);

            // Tính công nợ - group payments theo OrderId trước
            var paymentsByOrder = paymentsList
                .Where(p => p.OrderId.HasValue)
                .GroupBy(p => p.OrderId!.Value)
                .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));
            var orderTotals = orderItemsList.GroupBy(oi => oi.Id).ToDictionary(g => g.Key, g => g.Sum(oi => oi.Quantity * oi.UnitPrice));

            decimal totalDebt = 0;
            int debtOrders = 0;

            foreach (var order in ordersList)
            {
                var orderTotal = orderTotals.ContainsKey(order.Id) ? orderTotals[order.Id] : order.TotalPrice;
                var paidAmount = paymentsByOrder.ContainsKey(order.Id) ? paymentsByOrder[order.Id] : 0;
                var remaining = orderTotal - paidAmount;

                if (remaining > 0)
                {
                    totalDebt += remaining;
                    debtOrders++;
                }
            }

            // Top khách hàng - cần load thông tin Partner
            var monthOrdersFiltered = ordersList.Where(o => o.DateCreated >= monthStart && o.DateCreated < tomorrowStart).ToList();
            var partnerIds = monthOrdersFiltered
                .Where(o => o.PartnerId.HasValue)
                .Select(o => o.PartnerId!.Value)
                .Distinct()
                .ToList();

            Dictionary<Guid, (string Name, string DisplayName)> partnersDict = new();
            if (partnerIds.Any())
            {
                partnersDict = await _partnerService.SearchQuery(p => partnerIds.Contains(p.Id))
                    .Select(p => new { p.Id, p.Name, p.DisplayName })
                    .ToDictionaryAsync(p => p.Id, p => (p.Name ?? "", p.DisplayName ?? ""), cancellationToken);
            }

            var topCustomersData = monthOrdersFiltered
                .Where(o => o.PartnerId.HasValue)
                .GroupBy(o => o.PartnerId!.Value)
                .Select(g => new
                {
                    PartnerId = g.Key,
                    TotalRevenue = g.Sum(o => orderTotals.ContainsKey(o.Id) ? orderTotals[o.Id] : o.TotalPrice),
                    OrderCount = g.Count()
                })
                .OrderByDescending(x => x.TotalRevenue)
                .Take(5)
                .ToList();

            var topCustomers = topCustomersData.Select(x => new TopCustomerDto
            {
                PartnerId = x.PartnerId,
                PartnerName = partnersDict.ContainsKey(x.PartnerId) ? partnersDict[x.PartnerId].Name : string.Empty,
                PartnerDisplayName = partnersDict.ContainsKey(x.PartnerId) ? partnersDict[x.PartnerId].DisplayName : string.Empty,
                TotalRevenue = x.TotalRevenue,
                OrderCount = x.OrderCount
            }).ToList();

            // Doanh thu theo ngày (7 ngày gần nhất) - tính trong memory
            var dailyRevenues = new List<DailyRevenueDto>();
            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                var dayRevenue = paymentsList.Where(p => p.PaymentDate.Date == date).Sum(p => p.Amount);
                var dayOrders = ordersList.Count(o => o.DateCreated.Date == date);

                dailyRevenues.Add(new DailyRevenueDto
                {
                    Date = date,
                    Revenue = dayRevenue,
                    OrderCount = dayOrders
                });
            }

            return new DashboardStatsDto
            {
                TodayRevenue = todayPayments,
                WeekRevenue = weekPayments,
                MonthRevenue = monthPayments,
                YearRevenue = yearPayments,
                TodayOrders = todayOrders,
                WeekOrders = weekOrders,
                MonthOrders = monthOrders,
                YearOrders = yearOrders,
                ReceivedOrders = receivedOrders,
                ProcessingOrders = processingOrders,
                CompletedOrders = completedOrders,
                DeliveredOrders = deliveredOrders,
                TotalDebt = totalDebt,
                DebtOrders = debtOrders,
                TopCustomers = topCustomers,
                DailyRevenues = dailyRevenues,
                OverdueOrders = overdueOrders
            };
        }
    }
}
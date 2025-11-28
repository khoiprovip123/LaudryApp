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

namespace Application.Reports.Queries
{
    public class GetRevenueReportQuery : IRequest<RevenueReportDto>
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public bool IncludeByService { get; set; } = true;
        public bool IncludeByCustomer { get; set; } = true;
        public bool IncludeDailyDetails { get; set; } = true;
    }

    public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, RevenueReportDto>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IPartnerService _partnerService;
        private readonly IWorkContext _workContext;

        public GetRevenueReportQueryHandler(
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

        public async Task<RevenueReportDto> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;
            var isSuperAdmin = _workContext.IsSuperAdmin;
            if (companyId == null && !isSuperAdmin)
            {
                throw new Exception("Không xác định được cửa hàng của người dùng.");
            }

            var dateFrom = request.DateFrom.Date;
            var dateTo = request.DateTo.Date.AddDays(1); // Để bao gồm cả ngày cuối

            var orders = _orderService.SearchQuery(o => 
                o.CompanyId == companyId && 
                o.DateCreated >= dateFrom && 
                o.DateCreated < dateTo)
                .Include(o => o.Partner)
                .Include(o => o.OrderItems);

            var payments = _paymentService.SearchQuery(p => 
                p.CompanyId == companyId && 
                p.PaymentDate >= dateFrom && 
                p.PaymentDate < dateTo);

            // Tổng doanh thu từ Payments
            var totalRevenue = await payments
                .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

            // Load tất cả orders một lần để dùng cho nhiều mục đích
            var allOrders = await orders.ToListAsync(cancellationToken);
            
            // Tổng số đơn hàng
            var totalOrders = allOrders.Count;

            // Tính công nợ
            decimal totalDebt = 0;

            foreach (var order in allOrders)
            {
                var orderTotal = order.OrderItems?.Sum(oi => oi.Quantity * oi.UnitPrice) ?? order.TotalPrice;
                var paidAmount = await _paymentService.SearchQuery(p => p.OrderId == order.Id)
                    .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;
                var remaining = orderTotal - paidAmount;
                if (remaining > 0)
                {
                    totalDebt += remaining;
                }
            }

            var result = new RevenueReportDto
            {
                DateFrom = dateFrom,
                DateTo = request.DateTo.Date,
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                TotalDebt = totalDebt
            };

            // Doanh thu theo dịch vụ
            if (request.IncludeByService)
            {
                // Group trong memory để tránh lỗi GroupBy với anonymous type trong EF Core
                var revenueByService = allOrders
                    .SelectMany(o => o.OrderItems.Select(oi => new
                    {
                        ServiceId = oi.ServiceId,
                        ServiceName = oi.ServiceName,
                        Revenue = oi.Quantity * oi.UnitPrice,
                        Quantity = oi.Quantity,
                        OrderId = o.Id
                    }))
                    .GroupBy(x => new { x.ServiceId, x.ServiceName })
                    .Select(g => new RevenueByServiceDto
                    {
                        ServiceId = g.Key.ServiceId,
                        ServiceName = g.Key.ServiceName,
                        Revenue = g.Sum(x => x.Revenue),
                        OrderCount = g.Select(x => x.OrderId).Distinct().Count(),
                        Quantity = g.Sum(x => x.Quantity)
                    })
                    .OrderByDescending(x => x.Revenue)
                    .ToList();

                result.RevenueByService = revenueByService;
            }

            // Doanh thu theo khách hàng
            if (request.IncludeByCustomer)
            {
                var revenueByCustomer = new List<RevenueByCustomerDto>();

                // GroupBy trong memory để tránh lỗi GroupBy với navigation property
                var customerGroups = allOrders
                    .GroupBy(o => o.PartnerId)
                    .ToList();

                foreach (var group in customerGroups)
                {
                    var partnerId = group.Key ?? Guid.Empty;
                    var customerOrders = group.ToList();
                    
                    // Lấy Partner từ order đầu tiên trong group (đã được Include)
                    var partner = customerOrders.FirstOrDefault()?.Partner;

                    var customerRevenue = customerOrders
                        .SelectMany(o => o.OrderItems)
                        .Sum(oi => oi.Quantity * oi.UnitPrice);

                    var customerPaid = await payments
                        .Where(p => p.PartnerId == partnerId)
                        .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

                    var customerDebt = customerRevenue - customerPaid;

                    revenueByCustomer.Add(new RevenueByCustomerDto
                    {
                        PartnerId = partnerId,
                        PartnerName = partner?.Name ?? "",
                        PartnerDisplayName = partner?.DisplayName ?? "",
                        Revenue = customerRevenue,
                        PaidAmount = customerPaid,
                        DebtAmount = customerDebt > 0 ? customerDebt : 0,
                        OrderCount = customerOrders.Count
                    });
                }

                result.RevenueByCustomer = revenueByCustomer
                    .OrderByDescending(x => x.Revenue)
                    .ToList();
            }

            // Chi tiết theo ngày
            if (request.IncludeDailyDetails)
            {
                var dailyDetails = new List<DailyRevenueDetailDto>();
                var currentDate = dateFrom;

                while (currentDate < dateTo)
                {
                    var dayRevenue = await payments
                        .Where(p => p.PaymentDate.Date == currentDate)
                        .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

                    var dayOrders = allOrders
                        .Where(o => o.DateCreated.Date == currentDate)
                        .ToList();

                    var dayOrderIds = dayOrders.Select(o => o.Id).ToList();
                    var dayPaidOrders = await payments
                        .Where(p => p.OrderId.HasValue && dayOrderIds.Contains(p.OrderId.Value) && p.PaymentDate.Date == currentDate)
                        .Select(p => p.OrderId!.Value)
                        .Distinct()
                        .CountAsync(cancellationToken);

                    var dayDebtOrders = dayOrders.Count - dayPaidOrders;

                    dailyDetails.Add(new DailyRevenueDetailDto
                    {
                        Date = currentDate,
                        Revenue = dayRevenue,
                        OrderCount = dayOrders.Count,
                        PaidOrders = dayPaidOrders,
                        DebtOrders = dayDebtOrders
                    });

                    currentDate = currentDate.AddDays(1);
                }

                result.DailyDetails = dailyDetails;
            }

            return result;
        }
    }
}


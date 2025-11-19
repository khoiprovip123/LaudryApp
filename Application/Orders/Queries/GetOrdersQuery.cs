using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Orders.Queries
{
    public class GetOrdersQuery : IRequest<PagedResult<OrderDto>>
    {
        public int Limit { get; set; }
        public int Offset { get; set; }
        public Guid? PartnerId { get; set; }
        public string? Search { get; set; }
        public string? Status { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }

    class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, PagedResult<OrderDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOrderService _orderService;
        private readonly IWorkContext? _workContext;

        public GetOrdersQueryHandler(IHttpContextAccessor httpContextAccessor, IOrderService orderService, IWorkContext? workContext = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _orderService = orderService;
            _workContext = workContext;
        }

        public async Task<PagedResult<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = _orderService.SearchQuery();

            // Lọc theo CompanyId nếu người dùng thuộc một công ty
            var companyId = _workContext?.CompanyId;
            if (companyId != null)
            {
                orders = orders.Where(o => o.CompanyId == companyId);
            }

            // Lọc theo PartnerId
            if (request.PartnerId.HasValue)
            {
                orders = orders.Where(o => o.PartnerId == request.PartnerId);
            }

            // Lọc theo Status
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                orders = orders.Where(o => o.Status == request.Status);
            }

            // Lọc theo DateFrom
            if (request.DateFrom.HasValue)
            {
                orders = orders.Where(o => o.DateCreated >= request.DateFrom.Value);
            }

            // Lọc theo DateTo
            if (request.DateTo.HasValue)
            {
                var dateTo = request.DateTo.Value.Date.AddDays(1);
                orders = orders.Where(o => o.DateCreated < dateTo);
            }

            // Tìm kiếm theo Code hoặc Partner Name
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var kw = request.Search.Trim().ToLower();
                orders = orders.Where(o =>
                    (o.Code != null && o.Code.ToLower().Contains(kw)) ||
                    (o.Partner != null && o.Partner.Name != null && o.Partner.Name.ToLower().Contains(kw)) ||
                    (o.Partner != null && o.Partner.Ref != null && o.Partner.Ref.ToLower().Contains(kw)));
            }

            var totalItems = await orders.CountAsync(cancellationToken);

            var items = await orders
                .AsNoTracking()
                .Include(o => o.Partner)
                .Include(o => o.OrderItem)
                .ThenInclude(oi => oi.Order)
                .OrderByDescending(x => x.DateCreated)
                .Skip(request.Offset)
                .Take(request.Limit)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    Code = o.Code,
                    PartnerId = o.PartnerId,
                    PartnerName = o.Partner != null ? o.Partner.Name : string.Empty,
                    PartnerRef = o.Partner != null ? o.Partner.Ref : string.Empty,
                    PartnerDisplayName = o.Partner != null ? o.Partner.DisplayName : string.Empty,
                    PartnerPhone = o.Partner != null ? o.Partner.Phone : string.Empty,
                    TotalAmount = o.TotalPrice,
                    PaidAmount = 0, // TODO: Tính từ Payment khi có
                    RemainingAmount = o.TotalPrice, // TODO: Tính từ Payment khi có
                    Status = o.Status ?? string.Empty,
                    PaymentStatus = o.PaymentStatus ?? string.Empty,
                    Notes = o.Notes,
                    DateCreated = o.DateCreated,
                    DateUpdated = o.LastUpdated,
                    CreatedBy = o.CreatedBy,
                    UpdatedBy = o.UpdatedBy,
                    OrderItems = o.OrderItem.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ServiceId = oi.ServiceId,
                        ServiceName = oi.ServiceName,
                        ServiceCode = string.Empty, // TODO: Lấy từ Service nếu cần
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                }).ToListAsync(cancellationToken);

            return new PagedResult<OrderDto>(totalItems, request.Offset, request.Limit)
            {
                Items = items,
            };
        }
    }
}


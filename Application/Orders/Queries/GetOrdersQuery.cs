using Application.DTOs;
using Domain.Entity;
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
        private readonly IAsyncRepository<Domain.Entity.Payment>? _paymentRepository;

        public GetOrdersQueryHandler(
            IHttpContextAccessor httpContextAccessor, 
            IOrderService orderService, 
            IWorkContext? workContext = null,
            IAsyncRepository<Payment>? paymentRepository = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _orderService = orderService;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
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

            // Lọc theo DateFrom (từ đầu ngày)
            if (request.DateFrom.HasValue)
            {
                var dateFrom = request.DateFrom.Value.Date;
                orders = orders.Where(o => o.DateCreated >= dateFrom);
            }

            // Lọc theo DateTo (đến cuối ngày - bao gồm cả ngày đó)
            if (request.DateTo.HasValue)
            {
                var dateToEnd = request.DateTo.Value.Date.AddDays(1);
                orders = orders.Where(o => o.DateCreated < dateToEnd);
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
                .OrderByDescending(x => x.DateCreated)
                .Skip(request.Offset)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var orderDtos = items.Select(o =>
            {
                return new OrderDto
                {
                    Id = o.Id,
                    Code = o.Code,
                    PartnerId = o.PartnerId,
                    PartnerName = o.Partner != null ? o.Partner.Name : string.Empty,
                    PartnerRef = o.Partner != null ? o.Partner.Ref : string.Empty,
                    PartnerDisplayName = o.Partner != null ? o.Partner.DisplayName : string.Empty,
                    PartnerPhone = o.Partner != null ? o.Partner.Phone : string.Empty,
                    TotalAmount = o.TotalPrice,
                    PaidAmount = o.PaidAmount,
                    RemainingAmount = o.Residual,
                    Status = o.Status ?? string.Empty,
                    PaymentStatus = o.PaymentStatus ?? string.Empty,
                    Notes = o.Notes ?? string.Empty,
                    DateCreated = o.DateCreated,
                };
            }).ToList();

            return new PagedResult<OrderDto>(totalItems, request.Offset, request.Limit)
            {
                Items = orderDtos,
            };
        }
    }
}


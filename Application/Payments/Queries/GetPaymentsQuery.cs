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

namespace Application.Payments.Queries
{
    public class GetPaymentsQuery : IRequest<PagedResult<PaymentDto>>
    {
        public int Limit { get; set; }
        public int Offset { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? PartnerId { get; set; }
        public string? Search { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }

    class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, PagedResult<PaymentDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPaymentService _paymentService;
        private readonly IWorkContext? _workContext;

        public GetPaymentsQueryHandler(IHttpContextAccessor httpContextAccessor, IPaymentService paymentService, IWorkContext? workContext = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _paymentService = paymentService;
            _workContext = workContext;
        }

        public async Task<PagedResult<PaymentDto>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
        {
            var payments = _paymentService.SearchQuery();

            // Lọc theo CompanyId nếu người dùng thuộc một công ty
            var companyId = _workContext?.CompanyId;
            if (companyId != null)
            {
                payments = payments.Where(p => p.CompanyId == companyId);
            }

            // Lọc theo OrderId
            if (request.OrderId.HasValue)
            {
                payments = payments.Where(p => p.OrderId == request.OrderId);
            }

            // Lọc theo PartnerId
            if (request.PartnerId.HasValue)
            {
                payments = payments.Where(p => p.PartnerId == request.PartnerId);
            }

            // Lọc theo DateFrom
            if (request.DateFrom.HasValue)
            {
                payments = payments.Where(p => p.PaymentDate >= request.DateFrom.Value);
            }

            // Lọc theo DateTo
            if (request.DateTo.HasValue)
            {
                var dateTo = request.DateTo.Value.Date.AddDays(1);
                payments = payments.Where(p => p.PaymentDate < dateTo);
            }

            // Tìm kiếm theo Code hoặc PaymentCode
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var kw = request.Search.Trim().ToLower();
                payments = payments.Where(p =>
                    (p.PaymentCode != null && p.PaymentCode.ToLower().Contains(kw)) ||
                    (p.Order != null && p.Order.Code != null && p.Order.Code.ToLower().Contains(kw)) ||
                    (p.Partner != null && p.Partner.Name != null && p.Partner.Name.ToLower().Contains(kw)));
            }

            var totalItems = await payments.CountAsync(cancellationToken);

            var items = await payments
                .AsNoTracking()
                .Include(p => p.Order)
                .Include(p => p.Partner)
                .OrderByDescending(x => x.PaymentDate)
                .ThenByDescending(x => x.DateCreated)
                .Skip(request.Offset)
                .Take(request.Limit)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    OrderCode = p.Order != null ? p.Order.Code : string.Empty,
                    PartnerId = p.PartnerId,
                    PartnerName = p.Partner != null ? p.Partner.Name : string.Empty,
                    PartnerRef = p.Partner != null ? p.Partner.Ref : string.Empty,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentDate = p.PaymentDate,
                    Note = p.Note,
                    PaymentCode = p.PaymentCode,
                    DateCreated = p.DateCreated,
                    DateUpdated = p.LastUpdated,
                    CreatedBy = p.CreatedBy,
                    UpdatedBy = p.UpdatedBy
                }).ToListAsync(cancellationToken);

            return new PagedResult<PaymentDto>(totalItems, request.Offset, request.Limit)
            {
                Items = items,
            };
        }
    }
}


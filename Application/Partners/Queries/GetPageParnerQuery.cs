using Application.DTOs;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Partners.Queries
{
    public class GetPageParnerQuery : IRequest<PagedResult<PartnerDto>>
    {
        public int Limit { get; set; }
        public int Offset { get; set; }
        public string? Keyword { get; set; }
    }

    class GetPageParnerQueryHandler : IRequestHandler<GetPageParnerQuery, PagedResult<PartnerDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPartnerService _partnerService;
        public GetPageParnerQueryHandler(IHttpContextAccessor httpContextAccessor, IPartnerService partnerService)
        {
            _httpContextAccessor = httpContextAccessor;
            _partnerService = partnerService;
        }
        public async Task<PagedResult<PartnerDto>> Handle(GetPageParnerQuery request, CancellationToken cancellationToken)
        {
            var partners = _partnerService.SearchQuery(p => p.IsCustomer);

            // Lọc theo CompanyId nếu người dùng thuộc một công ty
            var ctx = _httpContextAccessor.HttpContext;
            var companyClaim = ctx?.User?.FindFirst("company_id");
            if (companyClaim != null && Guid.TryParse(companyClaim.Value, out var companyId))
            {
                partners = partners.Where(p => p.CompanyId == companyId);
            }

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var kw = request.Keyword.Trim();
                partners = partners.Where(p =>
                    p.Name.Contains(kw) || p.Phone.Contains(kw) || p.Ref.Contains(kw));
            }
            var totalItems = await partners.CountAsync();

            var items = await partners
                .OrderByDescending(x => x.Id)
                .Skip(request.Offset)
                .Take(request.Limit)
                .Select(p => new PartnerDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Ref = p.Ref,
                    Phone = p.Phone,
                    Active = p.Active,
                    Address = p.Address,
                    CityCode = p.CityCode,
                    CityName = p.CityName,
                    DistrictCode = p.DistrictCode,
                    DistrictName = p.DistrictName,
                    IsCustomer = p.IsCustomer,
                    IsCompany = p.IsCompany,
                }).ToListAsync();
            return new PagedResult<PartnerDto>(totalItems, request.Offset, request.Limit)
            {
                Items = items,

            };
        }
    }

    class PartnerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Ref { get; set; }
        public string NameNoSign { get; set; }
        public bool IsCustomer { get; set; }
        public bool IsCompany { get; set; }
        public string Phone { get; set; }
        public string? Notes { get; set; }
        public string? Address { get; set; }
        public string? CityCode { get; set; }
        public string? CityName { get; set; }
        public string? DistrictCode { get; set; }
        public string? DistrictName { get; set; }
        public string? WardCode { get; set; }
        public string? WardName { get; set; }
        public bool Active { get; set; }
    }
}



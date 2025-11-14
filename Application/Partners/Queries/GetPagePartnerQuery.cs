using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Partners.Queries
{
    public class GetPagePartnerQuery : IRequest<PagedResult<PartnerDto>>
    {
        public int Limit { get; set; }
        public int Offset { get; set; }
        public string? Search { get; set; }
    }

    class GetPagePartnerQueryHandler : IRequestHandler<GetPagePartnerQuery, PagedResult<PartnerDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPartnerService _partnerService;
        private readonly IWorkContext _workContext;
        public GetPagePartnerQueryHandler(IHttpContextAccessor httpContextAccessor, IPartnerService partnerService, IWorkContext workContext = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _partnerService = partnerService;
            _workContext = workContext;
        }
        public async Task<PagedResult<PartnerDto>> Handle(GetPagePartnerQuery request, CancellationToken cancellationToken)
        {
            var partners = _partnerService.SearchQuery(p => p.IsCustomer);

            // Lọc theo CompanyId nếu người dùng thuộc một công ty
            var ctx = _httpContextAccessor.HttpContext;
            var companyId = _workContext.CompanyId;

            if (companyId != null)
            {
                partners = partners.Where(p => p.CompanyId == companyId);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var kw = request.Search.Trim().ToLower();
                partners = partners.Where(p =>
                    (p.Name != null && p.Name.ToLower().Contains(kw)) ||
                    (p.Phone != null && p.Phone.Contains(kw)) ||
                    (p.PhoneLastThreeDigits != null && p.PhoneLastThreeDigits.Contains(kw)) ||
                    (p.Ref != null && p.Ref.ToLower().Contains(kw)) ||
                    (p.NameNoSign != null && p.NameNoSign.ToLower().Contains(kw)));
            }
            var totalItems = await partners.CountAsync(cancellationToken);

            var items = await partners
                .AsNoTracking()
                .OrderByDescending(x => x.DateCreated)
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


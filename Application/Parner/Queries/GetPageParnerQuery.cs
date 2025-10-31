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

namespace Application.Customers.Queries
{
    public class GetPageParnerQuery : IRequest<PagedResult<PartnerDto>>
    {
        public int Limit { get; set; }
        public int Offset { get; set; }
    }

    class GetPageParnerQueryHandler : IRequestHandler<GetPageParnerQuery, PagedResult<PartnerDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IParnerService _parnerService;
        public GetPageParnerQueryHandler(IHttpContextAccessor httpContextAccessor, IParnerService parnerService)
        {
            _httpContextAccessor = httpContextAccessor;
            _parnerService = parnerService;
        }
        public async Task<PagedResult<PartnerDto>> Handle(GetPageParnerQuery request, CancellationToken cancellationToken)
        {
            var partners = _parnerService.SearchQuery();
            var totalItems = await partners.CountAsync();

            var items = await partners
                .Skip(request.Offset)
                .Take(request.Limit)
                .Select(p => new PartnerDto
                {
                    Name = p.Name,
                    Ref = p.Ref,
                    Active = p.Active,
                    Address = p.Address,
                    CityCode = p.CityCode,
                    CityName = p.CityName,
                    DistrictCode = p.DistrictCode,
                    DistrictName = p.DistrictName,
                }).ToListAsync();
            return new PagedResult<PartnerDto>(totalItems, request.Offset, request.Limit)
            {
                Items = items,

            };
        }
    }

    class PartnerDto
    {
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



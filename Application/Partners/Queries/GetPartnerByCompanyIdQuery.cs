using Application.DTOs;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Partners.Queries
{
	public class GetPartnerByCompanyIdQuery : IRequest<PartnerDto>
	{
		public Guid Id { get; set; }
	}

	class GetPartnerByCompanyIdQueryHandler : IRequestHandler<GetPartnerByCompanyIdQuery, PartnerDto>
	{
		private readonly IPartnerService _partnerService;
		public GetPartnerByCompanyIdQueryHandler(IPartnerService partnerService)
		{
			_partnerService = partnerService;
		}

		public async Task<PartnerDto> Handle(GetPartnerByCompanyIdQuery request, CancellationToken cancellationToken)
		{
            var partner = await _partnerService.GetByIdAsync(request.Id);
            if (partner == null)
                throw new Exception("Partner not found");

            return new PartnerDto
            {
                Id = partner.Id,
                Name = partner.Name ?? string.Empty,
                Ref = partner.Ref ?? string.Empty,
                NameNoSign = partner.NameNoSign ?? string.Empty,
                Phone = partner.Phone ?? string.Empty,
                Active = partner.Active,
                Address = partner.Address,
                CityCode = partner.CityCode,
                CityName = partner.CityName,
                DistrictCode = partner.DistrictCode,
                DistrictName = partner.DistrictName,
                IsCustomer = partner.IsCustomer,
                IsCompany = partner.IsCompany,
            };
        }
	}

}



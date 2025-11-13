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
			var partner =  _partnerService.SearchQuery();
			
            var a = new PartnerDto();
			return a;
		}
	}

}



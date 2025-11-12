using Application.DTOs;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Partners.Queries
{
	public class GetPartnerByIdQuery : IRequest<PartnerDto>
	{
		public Guid Id { get; set; }
	}

	class GetPartnerByIdQueryHandler : IRequestHandler<GetPartnerByIdQuery, PartnerDto>
	{
		private readonly IPartnerService _partnerService;
		public GetPartnerByIdQueryHandler(IPartnerService partnerService)
		{
			_partnerService = partnerService;
		}

		public async Task<PartnerDto> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
		{
			var a = new PartnerDto();
			return a;
		}
	}

}



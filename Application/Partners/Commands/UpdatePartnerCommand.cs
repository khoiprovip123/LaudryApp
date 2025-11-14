using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;

namespace Application.Partners.Commands
{
	public class UpdatePartnerCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public string Phone { get; set; }
        public string? PhoneLastThreeDigits { get; set; }
        public string? Notes { get; set; }
		public string? Address { get; set; }
		public string? CityCode { get; set; }
		public string? CityName { get; set; }
		public string? DistrictCode { get; set; }
		public string? DistrictName { get; set; }
		public string? WardCode { get; set; }
		public string? WardName { get; set; }
		public bool Active { get; set; } = true;
	}

	public class UpdatePartnerCommandHandler : IRequestHandler<UpdatePartnerCommand, Unit>
	{
		private readonly IPartnerService _partnerService;
		public UpdatePartnerCommandHandler(IPartnerService partnerService)
		{
			_partnerService = partnerService;
		}

		public async Task<Unit> Handle(UpdatePartnerCommand request, CancellationToken cancellationToken)
		{
			var partner = await _partnerService.GetByIdAsync(request.Id);
            if (partner == null) throw new UserFriendlyException("Khách hàng không tồn tại", "PARTNER_NOT_FOUND");

            partner.Name = request.Name ?? string.Empty;
            partner.Phone = request.Phone ?? string.Empty;
            partner.PhoneLastThreeDigits = request.PhoneLastThreeDigits;
            partner.Notes = request.Notes;
			partner.Address = request.Address;
			partner.CityCode = request.CityCode;
			partner.CityName = request.CityName;
			partner.DistrictCode = request.DistrictCode;
			partner.DistrictName = request.DistrictName;
			partner.WardCode = request.WardCode;
			partner.WardName = request.WardName;
			partner.Active = request.Active;

			await _partnerService.UpdateAsync(partner);
			return Unit.Value;
		}
	}
}



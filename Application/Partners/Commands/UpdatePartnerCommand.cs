using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;

namespace Application.Partners.Commands
{
	public class UpdatePartnerCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
		public required string Name { get; set; }
		public required string Phone { get; set; }
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
            
            // Tự động lấy 3 số cuối từ Phone nếu PhoneLastThreeDigits chưa được cung cấp
            var phoneLastThreeDigits = request.PhoneLastThreeDigits;
            if (string.IsNullOrEmpty(phoneLastThreeDigits) && !string.IsNullOrEmpty(request.Phone))
            {
                var digitsOnly = System.Text.RegularExpressions.Regex.Matches(request.Phone, @"\d+");
                if (digitsOnly.Count > 0)
                {
                    var lastMatch = digitsOnly[digitsOnly.Count - 1];
                    if (lastMatch.Value.Length >= 3)
                        phoneLastThreeDigits = lastMatch.Value.Substring(lastMatch.Value.Length - 3);
                    else if (lastMatch.Value.Length > 0)
                        phoneLastThreeDigits = lastMatch.Value;
                }
            }
            
            partner.PhoneLastThreeDigits = phoneLastThreeDigits;
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



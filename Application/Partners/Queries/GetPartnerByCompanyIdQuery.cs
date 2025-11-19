using Application.DTOs;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

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
		
		private static string BuildDisplayName(string? refCode, string? name, string? phoneLastThreeDigits, string? phone)
		{
			// Format: [mã]tên-3 số cuối
			var result = string.Empty;
			
			// Thêm mã (Ref) trong ngoặc vuông nếu có
			if (!string.IsNullOrEmpty(refCode))
			{
				result = "[" + refCode + "]";
			}
			
			// Thêm tên (không có khoảng trắng sau ngoặc vuông)
			if (!string.IsNullOrEmpty(name))
			{
				result += name;
			}
			
			// Thêm 3 số cuối số điện thoại
			string? phoneLastThree = phoneLastThreeDigits;
			if (string.IsNullOrEmpty(phoneLastThree) && !string.IsNullOrEmpty(phone))
			{
				// Lấy 3 số cuối từ Phone
				var digitsOnly = Regex.Matches(phone, @"\d+");
				if (digitsOnly.Count > 0)
				{
					var lastMatch = digitsOnly[digitsOnly.Count - 1];
					if (lastMatch.Value.Length >= 3)
						phoneLastThree = lastMatch.Value.Substring(lastMatch.Value.Length - 3);
					else if (lastMatch.Value.Length > 0)
						phoneLastThree = lastMatch.Value;
				}
			}
			
			if (!string.IsNullOrEmpty(phoneLastThree))
			{
				result += "-" + phoneLastThree;
			}
			
			return result;
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
                DisplayName = BuildDisplayName(partner.Ref, partner.Name, partner.PhoneLastThreeDigits, partner.Phone),
                NameNoSign = partner.NameNoSign ?? string.Empty,
                Phone = partner.Phone ?? string.Empty,
                PhoneLastThreeDigits = partner.PhoneLastThreeDigits,
                Active = partner.Active,
                Address = partner.Address,
                CityCode = partner.CityCode,
                CityName = partner.CityName,
                DistrictCode = partner.DistrictCode,
                DistrictName = partner.DistrictName,
                WardCode = partner.WardCode,
                WardName = partner.WardName,
                IsCustomer = partner.IsCustomer,
                IsCompany = partner.IsCompany,
            };
        }
	}

}



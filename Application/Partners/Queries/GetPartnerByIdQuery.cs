using Domain.Interfaces;
using Domain.Service;
using MediatR;
using System.Text.RegularExpressions;

namespace Application.Partners.Queries
{
	public class GetPartnerByIdQuery : IRequest<PartnerDto>
	{
		public Guid Id { get; set; }
	}

	class GetPartnerByIdQueryHandler : IRequestHandler<GetPartnerByIdQuery, PartnerDto>
	{
		private readonly IPartnerService _partnerService;
		private readonly IWorkContext? _workContext;
		
		public GetPartnerByIdQueryHandler(IPartnerService partnerService, IWorkContext? workContext = null)
		{
			_partnerService = partnerService;
			_workContext = workContext;
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

		public async Task<PartnerDto> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
		{
			var partner = await _partnerService.GetByIdAsync(request.Id);
			
			if (partner == null)
				throw new Exception("Khách hàng không tồn tại");

			// Kiểm tra CompanyId để đảm bảo user chỉ có thể lấy partner thuộc company của họ
			var companyId = _workContext?.CompanyId;
			if (companyId != null && _workContext != null && !_workContext.IsSuperAdmin)
			{
				if (partner.CompanyId != companyId)
					throw new UnauthorizedAccessException("Bạn không có quyền truy cập khách hàng này");
			}

			return new PartnerDto
			{
				Id = partner.Id,
				Name = partner.Name,
				Ref = partner.Ref,
				DisplayName = BuildDisplayName(partner.Ref, partner.Name, partner.PhoneLastThreeDigits, partner.Phone),
				NameNoSign = partner.NameNoSign,
				IsCustomer = partner.IsCustomer,
				IsCompany = partner.IsCompany,
				Phone = partner.Phone,
				PhoneLastThreeDigits = partner.PhoneLastThreeDigits,
				Notes = partner.Notes,
				Address = partner.Address,
				CityCode = partner.CityCode,
				CityName = partner.CityName,
				DistrictCode = partner.DistrictCode,
				DistrictName = partner.DistrictName,
				WardCode = partner.WardCode,
				WardName = partner.WardName,
				Active = partner.Active
			};
		}
	}

}



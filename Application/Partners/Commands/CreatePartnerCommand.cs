using Domain.Entity;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Application.Partners.Commands
{
	public class CreatePartnerCommand : IRequest<Unit>
	{
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
		public Guid? CompanyId { get; set; }
		public bool IsCustomer { get; set; } = true;
		public bool IsCompany { get; set; } = false;
	}

	public class CreatePartnerCommandHandle : IRequestHandler<CreatePartnerCommand, Unit>
	{
		private readonly Domain.Service.IPartnerService _partnerService;
		private readonly Domain.Service.IIRSequenceService _sequenceService;
		private readonly IHttpContextAccessor _httpContextAccessor;

		public CreatePartnerCommandHandle(Domain.Service.IPartnerService partnerService, Domain.Service.IIRSequenceService sequenceService, IHttpContextAccessor httpContextAccessor)
		{
			_partnerService = partnerService;
			_sequenceService = sequenceService;
			_httpContextAccessor = httpContextAccessor;
		}

		public async Task<Unit> Handle(CreatePartnerCommand request, CancellationToken cancellationToken)
		{
			// Lấy CompanyId từ claim nếu không truyền vào (chủ cửa hàng tạo khách)
			var companyId = request.CompanyId;
			if (companyId == null)
			{
				var ctx = _httpContextAccessor.HttpContext;
				var companyClaim = ctx?.User?.FindFirst("company_id");
				if (companyClaim == null || !Guid.TryParse(companyClaim.Value, out var parsedCompanyId))
                    throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");
                companyId = parsedCompanyId;
			}

			var partnerRef = await _sequenceService.GetNextRefAsync("Customer", companyId, cancellationToken);

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

			var partner = new Partner
			{
				Name = request.Name,
				Phone = request.Phone,
                PhoneLastThreeDigits = phoneLastThreeDigits,
                Notes = request.Notes,
				Address = request.Address,
				CityCode = request.CityCode,
				CityName = request.CityName,
				DistrictCode = request.DistrictCode,
				DistrictName = request.DistrictName,
				WardCode = request.WardCode,
				WardName = request.WardName,
				CompanyId = companyId,
				// Theo mô hình Odoo: customer chỉ là partner với cờ IsCustomer
				IsCustomer = true,
				IsCompany = request.IsCompany,
				Ref = partnerRef,
				NameNoSign = string.Empty,
                UserId = null // Không liên kết user
			};

			await _partnerService.CreateAsync(partner);
			return Unit.Value;
		}
	}
}

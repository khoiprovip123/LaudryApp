using Domain.Entity;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Partners.Commands
{
	public class CreatePartnerCommand : IRequest<Unit>
	{
		public string Name { get; set; }
		public string Phone { get; set; }
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
					throw new Exception("Không xác định được cửa hàng của người dùng.");
				companyId = parsedCompanyId;
			}

			var partnerRef = await _sequenceService.GetNextRefAsync("Customer", companyId, cancellationToken);

			var partner = new Partner
			{
				Name = request.Name,
				Phone = request.Phone,
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
                UserId = string.Empty // cột NOT NULL trong DB, không liên kết user
			};

			await _partnerService.CreateAsync(partner);
			return Unit.Value;
		}
	}
}

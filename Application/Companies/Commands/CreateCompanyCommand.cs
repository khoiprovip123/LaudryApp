using Domain.Constants;
using Domain.Entity;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Companies.Commands
{
	public class CreateCompanyCommand : IRequest<Unit>
	{
		public string CompanyName { get; set; }
		public string OwnerName { get; set; }
		public string UserName { get; set; }
		public string Password { get; set; }
		public string Phone { get; set; }
		public DateTime SubscriptionStartDate { get; set; }
		public DateTime? PeriodLockDate { get; set; }
		public bool Active { get; set; }
		public bool IsActive { get; set; }
	}

	public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, Unit>
	{
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly ICompanyService _companyService;
		private readonly IPartnerService _partnerService;
		private readonly IIRSequenceService _sequenceService;
		public CreateCompanyCommandHandler(UserManager<ApplicationUser> userManager, ICompanyService companyService, IPartnerService partnerService, IIRSequenceService sequenceService)
		{
			_userManager = userManager;
			_companyService = companyService;
			_partnerService = partnerService;
			_sequenceService = sequenceService;
		}

		public async Task<Unit> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
		{
			var company = new Company
			{
				CompanyName = request.CompanyName,
				OwnerName = request.OwnerName,
				Phone = request.Phone,
				SubscriptionStartDate = request.SubscriptionStartDate,
				PeriodLockDate = request.PeriodLockDate,
				Active = request.Active,
			};
			await _companyService.CreateAsync(company);

			// Tạo partner đại diện cửa hàng (IsCompany = true)
			var partnerRef = await _sequenceService.GetNextRefAsync("Company", company.Id, cancellationToken);
			var partner = new Partner()
			{
				Active = request.IsActive,
				Name = request.OwnerName,
				NameNoSign = request.OwnerName,
				IsCompany = true,
				IsCustomer = false,
				Phone = request.Phone,
				CompanyId = company.Id,
				Ref = partnerRef,
				UserId = string.Empty
			};

			// Tạo user gốc cho cửa hàng (IsUserRoot = true nghĩa là UserRoot)
			var user = new ApplicationUser()
			{
				UserName = request.UserName,
				CompanyId = company.Id,
				IsUserRoot = true, // Đánh dấu là chủ cửa hàng (UserRoot)
				Active = true,
				IsSuperAdmin = false
			};

			await _partnerService.CreateAsync(partner);
			var createResult = await _userManager.CreateAsync(user, request.Password);
			
			if (createResult.Succeeded)
			{
				// Gán role "UserRoot" cho chủ cửa hàng (IsUserRoot = true) - có toàn quyền
				await _userManager.AddToRoleAsync(user, Domain.Constants.Roles.UserRoot);
			}

			return Unit.Value;
		}
	}
}

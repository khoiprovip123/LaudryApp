using Domain.Service;
using MediatR;

namespace Application.Companies.Commands
{
	public class UpdateCompanyCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
		public string CompanyName { get; set; }
		public string OwnerName { get; set; }
		public string Phone { get; set; }
		public DateTime SubscriptionStartDate { get; set; }
		public DateTime? PeriodLockDate { get; set; }
		public bool Active { get; set; }
	}

	public class UpdateCompanyCommandHandler : IRequestHandler<UpdateCompanyCommand, Unit>
	{
		private readonly ICompanyService _companyService;
		public UpdateCompanyCommandHandler(ICompanyService companyService)
		{
			_companyService = companyService;
		}

		public async Task<Unit> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
		{
			var company = await _companyService.GetByIdAsync(request.Id);
			if (company == null)
				throw new Exception("Company không tồn tại");

			company.CompanyName = request.CompanyName;
			company.OwnerName = request.OwnerName;
			company.Phone = request.Phone;
			company.SubscriptionStartDate = request.SubscriptionStartDate;
			company.PeriodLockDate = request.PeriodLockDate;
			company.Active = request.Active;

			await _companyService.UpdateAsync(company);
			return Unit.Value;
		}
	}
}


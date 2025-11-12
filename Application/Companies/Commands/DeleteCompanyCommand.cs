using Domain.Service;
using MediatR;

namespace Application.Companies.Commands
{
	public class DeleteCompanyCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
	}

	public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, Unit>
	{
		private readonly ICompanyService _companyService;
		public DeleteCompanyCommandHandler(ICompanyService companyService)
		{
			_companyService = companyService;
		}

		public async Task<Unit> Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
		{
			var company = await _companyService.GetByIdAsync(request.Id);
			if (company == null)
				throw new Exception("Company không tồn tại");

			// Soft delete: đặt Active = false để tránh lỗi FK
			company.Active = false;
			await _companyService.UpdateAsync(company);

			return Unit.Value;
		}
	}
}


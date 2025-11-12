using Domain.Entity;
using Domain.Service;
using MediatR;

namespace Application.Companies.Queries
{
	public class GetCompanyByIdQuery : IRequest<Company>
	{
		public Guid Id { get; set; }
	}

	class GetCompanyByIdQueryHandler : IRequestHandler<GetCompanyByIdQuery, Company>
	{
		private readonly ICompanyService _companyService;
		public GetCompanyByIdQueryHandler(ICompanyService companyService)
		{
			_companyService = companyService;
		}

		public async Task<Company> Handle(GetCompanyByIdQuery request, CancellationToken cancellationToken)
		{
			var company = await _companyService.GetByIdAsync(request.Id);
			if (company == null)
				throw new Exception("Company không tồn tại");
			return company;
		}
	}
}


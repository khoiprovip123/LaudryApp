using Application.DTOs;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Companies.Queries
{
	public class GetPageCompanyQuery : IRequest<PagedResult<CompanyDto>>
	{
		public int Limit { get; set; }
		public int Offset { get; set; }
	}

	class GetPageCompanyQueryHandler : IRequestHandler<GetPageCompanyQuery, PagedResult<CompanyDto>>
	{
		private readonly ICompanyService _companyService;
		public GetPageCompanyQueryHandler(ICompanyService companyService)
		{
			_companyService = companyService;
		}
		public async Task<PagedResult<CompanyDto>> Handle(GetPageCompanyQuery request, CancellationToken cancellationToken)
		{
			var companies = _companyService.SearchQuery();
			var totalItems = await companies.CountAsync(cancellationToken);

			var items = await companies
				.OrderByDescending(x => x.SubscriptionStartDate)
				.Skip(request.Offset)
				.Take(request.Limit)
				.Select(c => new CompanyDto
				{
					Id = c.Id,
					CompanyName = c.CompanyName,
					OwnerName = c.OwnerName,
					Phone = c.Phone,
					SubscriptionStartDate = c.SubscriptionStartDate,
					PeriodLockDate = c.PeriodLockDate,
					Active = c.Active
				}).ToListAsync(cancellationToken);

			return new PagedResult<CompanyDto>(totalItems, request.Offset, request.Limit)
			{
				Items = items
			};
		}
	}

	public class CompanyDto
	{
		public Guid Id { get; set; }
		public string CompanyName { get; set; }
		public string OwnerName { get; set; }
		public string Phone { get; set; }
		public DateTime SubscriptionStartDate { get; set; }
		public DateTime? PeriodLockDate { get; set; }
		public bool Active { get; set; }
	}
}
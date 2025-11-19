using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Domain.Services.Queries
{
	public class GetPageServiceQuery : IRequest<PagedResult<ServiceDto>>
	{
		public int Limit { get; set; }
		public int Offset { get; set; }
		public string? Search { get; set; }
	}

	class GetPageServiceQueryHandler : IRequestHandler<GetPageServiceQuery, PagedResult<ServiceDto>>
	{
		private readonly IHttpContextAccessor _httpContextAccessor;
		private readonly IServiceService _serviceService;
		private readonly IWorkContext _workContext;
		
		public GetPageServiceQueryHandler(IHttpContextAccessor httpContextAccessor, IServiceService serviceService, IWorkContext workContext = null)
		{
			_httpContextAccessor = httpContextAccessor;
			_serviceService = serviceService;
			_workContext = workContext;
		}
		
		public async Task<PagedResult<ServiceDto>> Handle(GetPageServiceQuery request, CancellationToken cancellationToken)
		{
			var services = _serviceService.SearchQuery();

			// Lọc theo CompanyId nếu người dùng thuộc một công ty
			var companyId = _workContext?.CompanyId;
			if (companyId != null && !_workContext.IsSuperAdmin)
			{
				services = services.Where(s => s.CompanyId == companyId);
			}

			if (!string.IsNullOrWhiteSpace(request.Search))
			{
				var kw = request.Search.Trim().ToLower();
				// Tối ưu: Sử dụng ToLower() một lần
				services = services.Where(s =>
					(s.Name != null && s.Name.ToLower().Contains(kw)) || 
					(s.DefaultCode != null && s.DefaultCode.ToLower().Contains(kw)) ||
					(s.Description != null && s.Description.ToLower().Contains(kw)));
			}

			var totalItems = await services.CountAsync(cancellationToken);

			// Đảm bảo sử dụng AsNoTracking() và chỉ select các fields cần thiết
			var items = await services
				.AsNoTracking() // Thêm AsNoTracking() để tăng performance
				.OrderByDescending(x => x.DateCreated)
				.Skip(request.Offset)
				.Take(request.Limit)
				.Select(s => new ServiceDto
				{
					Id = s.Id,
					Name = s.Name,
					UnitPrice = s.UnitPrice,
					UnitOfMeasure = s.UnitOfMeasure,
					Description = s.Description,
					DefaultCode = s.DefaultCode,
					Active = s.Active,
				}).ToListAsync(cancellationToken);

			return new PagedResult<ServiceDto>(totalItems, request.Offset, request.Limit)
			{
				Items = items,
			};
		}
	}

	public class ServiceDto
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public decimal UnitPrice { get; set; }
		public string UnitOfMeasure { get; set; }
		public string Description { get; set; }
		public string DefaultCode { get; set; }
		public bool Active { get; set; }
	}
}


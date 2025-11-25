using Domain.Services.Queries;
using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Domain.Services.Queries
{
	public class GetServiceByIdQuery : IRequest<ServiceDto>
	{
		public Guid Id { get; set; }
	}

	class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ServiceDto>
	{
		private readonly IServiceService _serviceService;
		private readonly IWorkContext _workContext;
		
		public GetServiceByIdQueryHandler(IServiceService serviceService, IWorkContext workContext = null)
		{
			_serviceService = serviceService;
			_workContext = workContext;
		}

		public async Task<ServiceDto> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
		{
			var service = await _serviceService.GetByIdAsync(request.Id);
			
			if (service == null)
				throw new Exception("Dịch vụ không tồn tại");

			// Kiểm tra CompanyId để đảm bảo user chỉ có thể lấy service thuộc company của họ
			var companyId = _workContext?.CompanyId;
			if (companyId != null && !_workContext.IsSuperAdmin)
			{
				if (service.CompanyId != companyId)
					throw new UnauthorizedAccessException("Bạn không có quyền truy cập dịch vụ này");
			}

			return new ServiceDto
			{
				Id = service.Id,
				Name = service.Name,
				UnitPrice = service.UnitPrice,
				UnitOfMeasure = service.UnitOfMeasure,
				IsWeightBased = service.IsWeightBased,
				MinimumWeight = service.MinimumWeight,
				MinimumPrice = service.MinimumPrice,
				Description = service.Description,
				DefaultCode = service.DefaultCode,
				Active = service.Active
			};
		}
	}
}


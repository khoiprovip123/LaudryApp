using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Http;
using ServiceEntity = Domain.Entity.Service;
using IServiceService = Domain.Service.IServiceService;

namespace Domain.Services.Commands
{
	public class CreateServiceCommand : IRequest<Unit>
	{
		public string Name { get; set; } = string.Empty;
		public decimal UnitPrice { get; set; }
		public string UnitOfMeasure { get; set; } = "kg";
		public bool IsWeightBased { get; set; } = false;
		public decimal? MinimumWeight { get; set; }
		public decimal? MinimumPrice { get; set; }
		public string? Description { get; set; }
		public bool Active { get; set; } = true;
	}

	public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, Unit>
	{
		private readonly IServiceService _serviceService;
		private readonly IIRSequenceService _sequenceService;
		private readonly IHttpContextAccessor _httpContextAccessor;
		private readonly IWorkContext? _workContext;

		public CreateServiceCommandHandler(IServiceService serviceService, IIRSequenceService sequenceService, IHttpContextAccessor httpContextAccessor, IWorkContext? workContext = null)
		{
			_serviceService = serviceService;
			_sequenceService = sequenceService;
			_httpContextAccessor = httpContextAccessor;
			_workContext = workContext;
		}

		public async Task<Unit> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
		{
			// Lấy CompanyId từ claim
			var companyId = _workContext?.CompanyId;
			if (companyId == null)
			{
				var ctx = _httpContextAccessor.HttpContext;
				var companyClaim = ctx?.User?.FindFirst("company_id");
				if (companyClaim == null || !Guid.TryParse(companyClaim.Value, out var parsedCompanyId))
					throw new Exception("Không xác định được cửa hàng của người dùng.");
				companyId = parsedCompanyId;
			}

			// Tự động sinh mã dịch vụ
			var serviceCode = await _sequenceService.GetNextRefAsync("Service", companyId, cancellationToken);

			var service = new ServiceEntity
			{
				Name = request.Name,
				UnitPrice = request.UnitPrice,
				UnitOfMeasure = request.UnitOfMeasure ?? "kg",
				IsWeightBased = request.IsWeightBased,
				MinimumWeight = request.MinimumWeight,
				MinimumPrice = request.MinimumPrice,
				Description = request.Description ?? string.Empty,
				DefaultCode = serviceCode,
				Active = request.Active,
				CompanyId = companyId
			};

			await _serviceService.CreateAsync(service);
			return Unit.Value;
		}
	}
}


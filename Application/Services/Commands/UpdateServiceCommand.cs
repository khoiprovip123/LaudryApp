using Domain.Service;
using MediatR;

namespace Application.Services.Commands
{
	public class UpdateServiceCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
		public string Name { get; set; } = string.Empty;
		public decimal UnitPrice { get; set; }
		public string UnitOfMeasure { get; set; } = "kg";
		public string? Description { get; set; }
		public bool Active { get; set; } = true;
	}

	public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, Unit>
	{
		private readonly IServiceService _serviceService;
		public UpdateServiceCommandHandler(IServiceService serviceService)
		{
			_serviceService = serviceService;
		}

		public async Task<Unit> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
		{
			var service = await _serviceService.GetByIdAsync(request.Id);
			if (service == null) throw new Exception("Dịch vụ không tồn tại");

			service.Name = request.Name;
			service.UnitPrice = request.UnitPrice;
			service.UnitOfMeasure = request.UnitOfMeasure ?? "kg";
			service.Description = request.Description ?? string.Empty;
			// Không cho phép sửa mã dịch vụ - giữ nguyên mã cũ
			// service.DefaultCode = request.DefaultCode ?? string.Empty;
			service.Active = request.Active;

			await _serviceService.UpdateAsync(service);
			return Unit.Value;
		}
	}
}


using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Services.Commands
{
	public class DeleteServiceCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
	}

	public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, Unit>
	{
		private readonly IServiceService _serviceService;
		private readonly IAsyncRepository<OrderItem> _orderItemRepository;

		public DeleteServiceCommandHandler(IServiceService serviceService, IAsyncRepository<OrderItem> orderItemRepository)
		{
			_serviceService = serviceService;
			_orderItemRepository = orderItemRepository;
		}

		public async Task<Unit> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
		{
			var service = await _serviceService.GetByIdAsync(request.Id);
			if (service == null) throw new Exception("Dịch vụ không tồn tại");

			// Kiểm tra xem dịch vụ có được sử dụng trong OrderItem không
			var hasOrderItems = await _orderItemRepository.Table
				.AnyAsync(oi => oi.ServiceId == request.Id, cancellationToken);

			if (hasOrderItems)
			{
				// Nếu đã được sử dụng → Soft delete
				service.Active = false;
				await _serviceService.UpdateAsync(service);
			}
			else
			{
				// Nếu chưa được sử dụng → Hard delete
				await _serviceService.DeleteAsync(service);
			}

			return Unit.Value;
		}
	}
}


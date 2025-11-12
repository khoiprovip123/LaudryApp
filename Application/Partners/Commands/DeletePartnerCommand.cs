using Domain.Service;
using MediatR;

namespace Application.Partners.Commands
{
	public class DeletePartnerCommand : IRequest<Unit>
	{
		public Guid Id { get; set; }
	}

	public class DeletePartnerCommandHandler : IRequestHandler<DeletePartnerCommand, Unit>
	{
		private readonly IPartnerService _partnerService;
		public DeletePartnerCommandHandler(IPartnerService partnerService)
		{
			_partnerService = partnerService;
		}

		public async Task<Unit> Handle(DeletePartnerCommand request, CancellationToken cancellationToken)
		{
			var partner = await _partnerService.GetByIdAsync(request.Id);
			if (partner == null) throw new Exception("Khách hàng không tồn tại");

			// Soft delete
			partner.Active = false;
			await _partnerService.UpdateAsync(partner);
			return Unit.Value;
		}
	}
}



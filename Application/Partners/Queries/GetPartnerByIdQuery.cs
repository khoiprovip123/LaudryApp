using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Application.Partners.Queries
{
	public class GetPartnerByIdQuery : IRequest<PartnerDto>
	{
		public Guid Id { get; set; }
	}

	class GetPartnerByIdQueryHandler : IRequestHandler<GetPartnerByIdQuery, PartnerDto>
	{
		private readonly IPartnerService _partnerService;
		private readonly IWorkContext? _workContext;
		
		public GetPartnerByIdQueryHandler(IPartnerService partnerService, IWorkContext? workContext = null)
		{
			_partnerService = partnerService;
			_workContext = workContext;
		}

		public async Task<PartnerDto> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
		{
			var partner = await _partnerService.GetByIdAsync(request.Id);
			
			if (partner == null)
				throw new Exception("Khách hàng không tồn tại");

			// Kiểm tra CompanyId để đảm bảo user chỉ có thể lấy partner thuộc company của họ
			var companyId = _workContext?.CompanyId;
			if (companyId != null && _workContext != null && !_workContext.IsSuperAdmin)
			{
				if (partner.CompanyId != companyId)
					throw new UnauthorizedAccessException("Bạn không có quyền truy cập khách hàng này");
			}

			return new PartnerDto
			{
				Id = partner.Id,
				Name = partner.Name,
				Ref = partner.Ref,
				NameNoSign = partner.NameNoSign,
				IsCustomer = partner.IsCustomer,
				IsCompany = partner.IsCompany,
				Phone = partner.Phone,
				Notes = partner.Notes,
				Address = partner.Address,
				CityCode = partner.CityCode,
				CityName = partner.CityName,
				DistrictCode = partner.DistrictCode,
				DistrictName = partner.DistrictName,
				WardCode = partner.WardCode,
				WardName = partner.WardName,
				Active = partner.Active
			};
		}
	}

}



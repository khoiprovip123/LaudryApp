using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Parner.Commands
{
    public class CreatePartnerCommand : IRequest<Unit>
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string? Notes { get; set; }
        public string? Address { get; set; }
        public string? CityCode { get; set; }
        public string? CityName { get; set; }
        public string? DistrictCode { get; set; }
        public string? DistrictName { get; set; }
        public string? WardCode { get; set; }
        public string? WardName { get; set; }
    }

    public class CreatePartnerCommandHandle : IRequestHandler<CreatePartnerCommand, Unit>
    {
        public async Task<Unit> Handle(CreatePartnerCommand request, CancellationToken cancellationToken)
        {


            return Unit.Value;
        }
    }


}

using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Dashboard.Queries
{
    public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }

    public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IPartnerService _partnerService;
        private readonly IWorkContext _workContext;

        public GetDashboardStatsQueryHandler(
            IOrderService orderService,
            IPaymentService paymentService,
            IPartnerService partnerService,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _partnerService = partnerService;
            _workContext = workContext;
        }

        public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var a = new DashboardStatsDto();
            return a;
        }
    }
}
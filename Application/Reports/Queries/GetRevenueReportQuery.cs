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

namespace Application.Reports.Queries
{
    public class GetRevenueReportQuery : IRequest<RevenueReportDto>
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public bool IncludeByService { get; set; } = true;
        public bool IncludeByCustomer { get; set; } = true;
        public bool IncludeDailyDetails { get; set; } = true;
    }

    public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, RevenueReportDto>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IPartnerService _partnerService;
        private readonly IWorkContext _workContext;

        public GetRevenueReportQueryHandler(
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

        public async Task<RevenueReportDto> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
        {
           

            return new RevenueReportDto();
        }
    }
}


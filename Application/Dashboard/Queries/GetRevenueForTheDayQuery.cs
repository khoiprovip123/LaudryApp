using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dashboard.Queries
{
    public class GetRevenueForTheDayQuery : IRequest<object>
    {
    }

    public class GetRevenueForTheDayQueryHandler : IRequestHandler<GetRevenueForTheDayQuery, object>
    {
        private readonly IPaymentOrderService _paymentOrderService;
        private readonly IWorkContext _workContext;

        public GetRevenueForTheDayQueryHandler(
            IWorkContext workContext,
            IPaymentOrderService paymentOrderService)
        {
            _workContext = workContext;
            _paymentOrderService = paymentOrderService;
        }

        public async Task<object> Handle(GetRevenueForTheDayQuery request, CancellationToken cancellationToken)
        {
            var companyId = _workContext.CompanyId;
            if (companyId == null) throw new UserFriendlyException("Không tìm thấy chi nhánh của người dùng");
            var today = DateTime.Today;

            var revenue = await _paymentOrderService.SearchQuery(x => x.CompanyId == companyId)
                .AsNoTracking()
                .Where(x => x.DateCreated >= today.AbsoluteBeginOfDate() && x.DateCreated < today.AbsoluteEndOfDate())
                .SumAsync(x => x.AmountAllocated); ;

            return  new {RevenueToDay = revenue};
        }
    }
}

using Application.DTOs;
using Domain.Constants;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Dashboard.Queries
{
    public class GetCountOrdersTodayByStatusQuery : IRequest<object>
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public Guid? CompanyId { get; set; }
    }

    public class GetCountOrdersTodayByStatusQueryHandler : IRequestHandler<GetCountOrdersTodayByStatusQuery, object>
    {
        private readonly IOrderService _orderService;
        private readonly IWorkContext _workContext;

        public GetCountOrdersTodayByStatusQueryHandler(
            IOrderService orderService,
            IPaymentService paymentService,
            IPartnerService partnerService,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _workContext = workContext;
        }

        public async Task<object> Handle(GetCountOrdersTodayByStatusQuery request, CancellationToken cancellationToken)
        {
            var companyId = _workContext.CompanyId;
            if(companyId == null) {
                throw new UserFriendlyException("Không tìm thấy chi nhánh của người dùng"); 
            }
            var query = _orderService.SearchQuery(x => x.CompanyId == companyId);

            if (request.DateFrom.HasValue)
                query = query.Where(x => x.DateCreated >= request.DateFrom.Value.AbsoluteBeginOfDate());

            if (request.DateTo.HasValue)
                query = query.Where(x => x.DateCreated <= request.DateTo.Value.AbsoluteEndOfDate());

            var data = await query.AsNoTracking().GroupBy(x => x.Status).Select(x => new
            {
                Status = x.Key!,
                Count = x.Count()
            }).ToDictionaryAsync(x => x.Status,x => x.Count);

            var allStatuses = new[]
            {
                 OrderStatus.Received,
                 OrderStatus.Processing,
                 OrderStatus.Completed,
                 OrderStatus.Delivered
             };

            var result = allStatuses.Select(s => new
            {
                Status = s,
                Count = data.TryGetValue(s, out var total) ? total : 0
            });

            return result;
        }
    }
}
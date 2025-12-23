using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.OrderPayment.Queries
{
    public class GetOrderPaymentByIdQuery : IRequest<IEnumerable<PaymentDto>>
    {
        public Guid OrderId { get; set; }
    }

    class GetOrderPaymentByIdQueryHandler : IRequestHandler<GetOrderPaymentByIdQuery, IEnumerable<PaymentDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext? _workContext;
        private readonly IPaymentOrderService _paymentOrderService;

        public GetOrderPaymentByIdQueryHandler(IHttpContextAccessor httpContextAccessor, IWorkContext? workContext, IPaymentOrderService paymentOrderService)
        {
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
            _paymentOrderService = paymentOrderService;
        }

        public async Task<IEnumerable<PaymentDto>> Handle(GetOrderPaymentByIdQuery request, CancellationToken cancellationToken)
        {

            var list = await _paymentOrderService.SearchQuery(x => x.OrderId == request.OrderId)
                .Include(x => x.Payment)
                .Include(x => x.Order)
                .ThenInclude(x => x.Partner)
                .Select(x => new PaymentDto
                {
                    PaymentId = x.PaymentId,
                    PartnerName = x.Order.Partner != null ? x.Order.Partner.Name : null,
                    PartnerRef = x.Order.Partner != null ? x.Order.Partner.Ref : null,
                    Amount = x.AmountAllocated,
                    PaymentCode = x.Payment.PaymentCode != null ? x.Payment.PaymentCode : null,
                    PaymentDate = x.Payment.PaymentDate != null ? x.Payment.PaymentDate : null,
                    PaymentMethod = x.Payment.PaymentMethod != null ? x.Payment.PaymentMethod : null,
                    Note = x.Payment.Note,
                }).ToListAsync();

            return list;
        }
    }
}


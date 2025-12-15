using Application.DTOs;
using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Payments.Queries
{
    public class GetPaymentsQuery : IRequest<PagedResult<PaymentDto>>
    {
        public int Limit { get; set; }
        public int Offset { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? PartnerId { get; set; }
        public string? Search { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }

    class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, PagedResult<PaymentDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPaymentService _paymentService;
        private readonly IWorkContext? _workContext;

        public GetPaymentsQueryHandler(IHttpContextAccessor httpContextAccessor, IPaymentService paymentService, IWorkContext? workContext = null, IRepository<PaymentOrder> paymentOrder = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _paymentService = paymentService;
            _workContext = workContext;
        }

        public async Task<PagedResult<PaymentDto>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
        {

            var paymentOrder = await _paymentService.SearchQuery(x => x.PartnerId == request.PartnerId).Select(x => new PaymentDto
            {
                PartnerId = x.PartnerId,
                Amount = x.Amount,
                PaymentMethod = x.PaymentMethod,
                PaymentDate = x.PaymentDate,
                Note = x.Note,
                PaymentCode = x.PaymentCode,
                DateCreated = x.DateCreated,
            }).ToListAsync();

            return new PagedResult<PaymentDto>(5, request.Offset, request.Limit)
            {
                Items = paymentOrder
            };
        }
    }
}


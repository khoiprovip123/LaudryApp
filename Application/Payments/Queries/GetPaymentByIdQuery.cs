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

namespace Application.Payments.Queries
{
    public class GetPaymentByIdQuery : IRequest<PaymentDto>
    {
        public Guid Id { get; set; }
    }

    class GetPaymentByIdQueryHandler : IRequestHandler<GetPaymentByIdQuery, PaymentDto>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPaymentService _paymentService;
        private readonly IWorkContext? _workContext;

        public GetPaymentByIdQueryHandler(IHttpContextAccessor httpContextAccessor, IPaymentService paymentService, IWorkContext? workContext = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _paymentService = paymentService;
            _workContext = workContext;
        }

        public async Task<PaymentDto> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
        {
            return new PaymentDto();
        }
    }
}


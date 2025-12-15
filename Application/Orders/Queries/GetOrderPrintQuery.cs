using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders.Queries
{
    public class GetOrderPrintQuery : IRequest<OrderPrintDto>
    {
        public Guid OrderId { get; set; }
        public string PrintType { get; set; } = "Receive"; // "Receive" hoặc "Delivery"
    }

    public class GetOrderPrintQueryHandler : IRequestHandler<GetOrderPrintQuery, OrderPrintDto>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly ICompanyService _companyService;
        private readonly IWorkContext _workContext;

        public GetOrderPrintQueryHandler(
            IOrderService orderService,
            IPaymentService paymentService,
            ICompanyService companyService,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _companyService = companyService;
            _workContext = workContext;
        }

        public async Task<OrderPrintDto> Handle(GetOrderPrintQuery request, CancellationToken cancellationToken)
        {
            var result = new OrderPrintDto();
            return result;
        }
    }
}


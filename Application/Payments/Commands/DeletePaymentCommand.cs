using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Payments.Commands
{
    public class DeletePaymentCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeletePaymentCommandHandler : IRequestHandler<DeletePaymentCommand, Unit>
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<Payment> _paymentRepository;

        public DeletePaymentCommandHandler(
            IPaymentService paymentService,
            IOrderService orderService,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext,
            IAsyncRepository<Payment> paymentRepository)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
        }

        public async Task<Unit> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
        {
         

            return Unit.Value;
        }
    }
}


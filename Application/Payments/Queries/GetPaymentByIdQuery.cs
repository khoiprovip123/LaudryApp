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
            var payment = await _paymentService.SearchQuery(p => p.Id == request.Id)
                .AsNoTracking()
                .Include(p => p.Order)
                .Include(p => p.Partner)
                .FirstOrDefaultAsync(cancellationToken);

            if (payment == null)
                throw new UserFriendlyException("Thanh toán không tồn tại.", "PAYMENT_NOT_FOUND");

            // Kiểm tra quyền truy cập theo CompanyId
            var companyId = _workContext?.CompanyId;
            if (companyId != null && payment.CompanyId != companyId)
                throw new UserFriendlyException("Bạn không có quyền truy cập thanh toán này.", "PAYMENT_ACCESS_DENIED");

            return new PaymentDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                OrderCode = payment.Order != null ? payment.Order.Code : string.Empty,
                PartnerId = payment.PartnerId,
                PartnerName = payment.Partner != null ? payment.Partner.Name : string.Empty,
                PartnerRef = payment.Partner != null ? payment.Partner.Ref : string.Empty,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                PaymentDate = payment.PaymentDate,
                Note = payment.Note,
                PaymentCode = payment.PaymentCode,
                DateCreated = payment.DateCreated,
                DateUpdated = payment.LastUpdated,
            };
        }
    }
}


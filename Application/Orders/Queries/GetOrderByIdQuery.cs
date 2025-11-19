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

namespace Application.Orders.Queries
{
    public class GetOrderByIdQuery : IRequest<OrderDto>
    {
        public Guid Id { get; set; }
    }

    class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOrderService _orderService;
        private readonly IWorkContext? _workContext;
        private readonly IAsyncRepository<Domain.Entity.Payment>? _paymentRepository;

        public GetOrderByIdQueryHandler(
            IHttpContextAccessor httpContextAccessor, 
            IOrderService orderService, 
            IWorkContext? workContext = null,
            IAsyncRepository<Domain.Entity.Payment>? paymentRepository = null)
        {
            _httpContextAccessor = httpContextAccessor;
            _orderService = orderService;
            _workContext = workContext;
            _paymentRepository = paymentRepository;
        }

        public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await _orderService.SearchQuery(o => o.Id == request.Id)
                .AsNoTracking()
                .Include(o => o.Partner)
                .Include(o => o.OrderItem)
                .FirstOrDefaultAsync(cancellationToken);

            if (order == null)
                throw new UserFriendlyException("Đơn hàng không tồn tại.", "ORDER_NOT_FOUND");

            // Kiểm tra quyền truy cập theo CompanyId
            var companyId = _workContext?.CompanyId;
            if (companyId != null && order.CompanyId != companyId)
                throw new UserFriendlyException("Bạn không có quyền truy cập đơn hàng này.", "ORDER_ACCESS_DENIED");

            var orderItems = order.OrderItem.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                OrderId = oi.OrderId,
                ServiceId = oi.ServiceId,
                ServiceName = oi.ServiceName,
                ServiceCode = string.Empty, // TODO: Lấy từ Service nếu cần
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            }).ToList();

            // Tính TotalAmount từ tổng OrderItems (ưu tiên) hoặc dùng TotalPrice nếu OrderItems rỗng
            // Đảm bảo tính từ quantity * unitPrice để chính xác
            decimal totalAmount = 0;
            if (orderItems.Count > 0)
            {
                totalAmount = orderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
            }
            else
            {
                totalAmount = order.TotalPrice;
            }

            // Tính PaidAmount từ Payments
            decimal paidAmount = 0;
            if (_paymentRepository != null)
            {
                paidAmount = await _paymentRepository.Table
                    .Where(p => p.OrderId.HasValue && p.OrderId.Value == order.Id)
                    .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;
            }

            var remainingAmount = totalAmount - paidAmount;

            return new OrderDto
            {
                Id = order.Id,
                Code = order.Code,
                PartnerId = order.PartnerId,
                PartnerName = order.Partner != null ? order.Partner.Name : string.Empty,
                PartnerRef = order.Partner != null ? order.Partner.Ref : string.Empty,
                PartnerDisplayName = order.Partner != null ? (order.Partner.DisplayName ?? string.Empty) : string.Empty,
                PartnerPhone = order.Partner != null ? order.Partner.Phone : string.Empty,
                TotalAmount = totalAmount,
                PaidAmount = paidAmount,
                RemainingAmount = remainingAmount,
                Status = order.Status ?? string.Empty,
                PaymentStatus = order.PaymentStatus ?? string.Empty,
                Notes = order.Notes ?? string.Empty,
                DateCreated = order.DateCreated,
                DateUpdated = order.LastUpdated,
                CreatedBy = order.CreatedBy,
                UpdatedBy = order.UpdatedBy,
                OrderItems = orderItems
            };
        }
    }
}


using Domain.Constants;
using Domain.Entity;
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

namespace Application.Orders.Commands
{
    public class CreateOrderCommand : IRequest<Guid>
    {
        public Guid PartnerId { get; set; }
        public List<CreateOrderItemRequest> OrderItems { get; set; } = new List<CreateOrderItemRequest>();
        public string? Notes { get; set; }
    }

    public class CreateOrderItemRequest
    {
        public Guid ServiceId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
    {
        private readonly IOrderService _orderService;
        private readonly IPartnerService _partnerService;
        private readonly IServiceService _serviceService;
        private readonly IIRSequenceService _sequenceService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;

        public CreateOrderCommandHandler(
            IOrderService orderService,
            IPartnerService partnerService,
            IServiceService serviceService,
            IIRSequenceService sequenceService,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _partnerService = partnerService;
            _serviceService = serviceService;
            _sequenceService = sequenceService;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
        }

        public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            // Lấy CompanyId từ WorkContext
            var companyId = _workContext.CompanyId;
            if (companyId == null)
            {
                var ctx = _httpContextAccessor.HttpContext;
                var companyClaim = ctx?.User?.FindFirst("company_id");
                if (companyClaim == null || !Guid.TryParse(companyClaim.Value, out var parsedCompanyId))
                    throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");
                companyId = parsedCompanyId;
            }

            // Lấy UserId từ claim
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            Guid? userId = null;
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsedUserId))
            {
                userId = parsedUserId;
            }

            // Validate Partner
            var partner = await _partnerService.GetByIdAsync(request.PartnerId);
            if (partner == null)
                throw new UserFriendlyException("Khách hàng không tồn tại.", "PARTNER_NOT_FOUND");

            if (partner.CompanyId != companyId)
                throw new UserFriendlyException("Khách hàng không thuộc cửa hàng này.", "PARTNER_COMPANY_MISMATCH");

            // Validate và lấy thông tin Services
            var serviceIds = request.OrderItems.Select(x => x.ServiceId).Distinct().ToList();
            var services = await _serviceService.SearchQuery(s => serviceIds.Contains(s.Id) && s.Active)
                .ToListAsync(cancellationToken);

            if (services.Count != serviceIds.Count)
                throw new UserFriendlyException("Một hoặc nhiều dịch vụ không tồn tại hoặc không hoạt động.", "SERVICE_NOT_FOUND");

            // Tính tổng tiền
            decimal totalPrice = 0;
            var orderItems = new List<OrderItem>();

            foreach (var itemRequest in request.OrderItems)
            {
                var service = services.FirstOrDefault(s => s.Id == itemRequest.ServiceId);
                if (service == null)
                    throw new UserFriendlyException($"Dịch vụ với ID {itemRequest.ServiceId} không tồn tại.", "SERVICE_NOT_FOUND");

                // Validate unitPrice từ FE phải khớp với giá trong DB
                if (service.UnitPrice != itemRequest.UnitPrice)
                    throw new UserFriendlyException($"Giá dịch vụ {service.Name} đã thay đổi. Vui lòng làm mới trang.", "PRICE_MISMATCH");

                var orderItem = new OrderItem(
                    itemRequest.ServiceId,
                    service.Name,
                    itemRequest.UnitPrice,
                    itemRequest.Quantity
                )
                {
                    CompanyId = companyId
                };

                orderItems.Add(orderItem);
                totalPrice += orderItem.TotalPrice;
            }

            // Tạo mã đơn hàng
            var orderCode = await _sequenceService.GetNextRefAsync("Order", companyId, cancellationToken);

            // Tạo Order với trạng thái Received (đã nhận đồ)
            var receivedTime = DateTime.Now;
            var order = new Order(
                code: orderCode,
                partnerId: request.PartnerId,
                addressText: null,
                requestedPickupTime: null,
                receivedTime: receivedTime,
                status: OrderStatus.Received, // Trạng thái khởi tạo: Đã nhận đồ
                paymentStatus: "Unpaid", // Trạng thái thanh toán mặc định
                totalPrice: totalPrice,
                createdBy: userId,
                updatedBy: null,
                notes: request.Notes
            )
            {
                CompanyId = companyId
            };

            // Thêm OrderItems vào Order
            foreach (var item in orderItems)
            {
                item.OrderId = order.Id;
                order.OrderItem.Add(item);
            }

            // Lưu Order (sẽ tự động lưu OrderItems do navigation property)
            await _orderService.CreateAsync(order);

            return order.Id;
        }
    }
}


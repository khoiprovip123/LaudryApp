using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Reflection;

namespace Application.Orders.Commands
{
    public class UpdateOrderItemCommand : IRequest<Unit>
    {
        public Guid OrderItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public float? WeightInKg { get; set; }
    }

    public class UpdateOrderItemCommandHandler : IRequestHandler<UpdateOrderItemCommand, Unit>
    {
        private readonly IOrderService _orderService;
        private readonly IAsyncRepository<OrderItem> _orderItemRepository;

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;

        public UpdateOrderItemCommandHandler(
            IOrderService orderService,
            IAsyncRepository<OrderItem> orderItemRepository,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _orderItemRepository = orderItemRepository;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(UpdateOrderItemCommand request, CancellationToken cancellationToken)
        {
            // Lấy CompanyId từ WorkContext
            var companyId = _workContext.CompanyId;
            var isSuperAdmin = _workContext.IsSuperAdmin;
            if (companyId == null && !isSuperAdmin)
            {
                throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");
            }

            // Lấy OrderItem
            var orderItem = await _orderItemRepository.SearchQuery(x => x.Id == request.OrderItemId).FirstOrDefaultAsync();
            //var b = await _orderService.SearchQuery(x => x.Id == orderItem.OrderId).FirstOrDefaultAsync();

            if (orderItem == null)
                throw new UserFriendlyException("Chi tiết dịch vụ không tồn tại.", "ORDER_ITEM_NOT_FOUND");

            // Kiểm tra quyền truy cập theo CompanyId
            if (orderItem.CompanyId != companyId && !isSuperAdmin)
                throw new UserFriendlyException("Bạn không có quyền cập nhật chi tiết dịch vụ này.", "ORDER_ITEM_ACCESS_DENIED");
            // Validate dữ liệu
            if (request.Quantity < 0)
                throw new UserFriendlyException("Số lượng không được âm.", "INVALID_QUANTITY");

            if (request.UnitPrice < 0)
                throw new UserFriendlyException("Đơn giá không được âm.", "INVALID_UNIT_PRICE");

            if (request.TotalPrice < 0)
                throw new UserFriendlyException("Thành tiền không được âm.", "INVALID_TOTAL_PRICE");

            if (orderItem.IsWeightBased && request.WeightInKg.HasValue && request.WeightInKg.Value < 0)
                throw new UserFriendlyException("Số kg không được âm.", "INVALID_WEIGHT");

            orderItem.TotalPrice = request.TotalPrice;
            orderItem.Quantity = request.Quantity;
            orderItem.UnitPrice = request.UnitPrice;
            orderItem.WeightInKg = request.WeightInKg ?? orderItem.WeightInKg;

            // Lưu OrderItem
            await _orderItemRepository.UpdateAsync(orderItem);

            var idO = orderItem.OrderId;
            var order = await _orderService.GetByIdAsync(idO);


            // Tính lại tổng tiền của Order
            _orderService.ComputeAmountForOrder(order);
            await _orderService.UpdateAsync(order);

            return Unit.Value;
        }
    }
}


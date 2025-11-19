using Domain.Constants;
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
    public class UpdateOrderStatusCommand : IRequest<Unit>
    {
        public Guid OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Unit>
    {
        private readonly IOrderService _orderService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;

        public UpdateOrderStatusCommandHandler(
            IOrderService orderService,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            // Validate trạng thái
            if (!OrderStatus.IsValid(request.Status))
            {
                throw new UserFriendlyException(
                    $"Trạng thái không hợp lệ. Các trạng thái hợp lệ: {string.Join(", ", OrderStatus.GetAll())}",
                    "INVALID_STATUS");
            }

            // Lấy Order
            var order = await _orderService.GetByIdAsync(request.OrderId);
            if (order == null)
                throw new UserFriendlyException("Đơn hàng không tồn tại.", "ORDER_NOT_FOUND");

            // Kiểm tra quyền truy cập theo CompanyId
            var companyId = _workContext.CompanyId;
            if (companyId != null && order.CompanyId != companyId)
                throw new UserFriendlyException("Bạn không có quyền truy cập đơn hàng này.", "ORDER_ACCESS_DENIED");

            // Validate chuyển đổi trạng thái hợp lệ
            ValidateStatusTransition(order.Status, request.Status);

            // Lấy UserId từ claim
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            Guid? userId = null;
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsedUserId))
            {
                userId = parsedUserId;
            }

            // Cập nhật trạng thái
            order.Status = request.Status;
            order.UpdatedBy = userId;

            // Tự động cập nhật ReceivedTime khi chuyển sang Received (nếu chưa có)
            if (request.Status == OrderStatus.Received && order.ReceivedTime == null)
            {
                order.ReceivedTime = DateTime.Now;
            }

            await _orderService.UpdateAsync(order);
            return Unit.Value;
        }

        private void ValidateStatusTransition(string? currentStatus, string newStatus)
        {
            // Cho phép chuyển từ null hoặc bất kỳ trạng thái nào sang Received (nếu cần reset)
            if (newStatus == OrderStatus.Received)
                return;

            // Quy tắc chuyển đổi trạng thái:
            // Received → Processing → Completed → Delivered
            switch (currentStatus)
            {
                case OrderStatus.Received:
                    // Received chỉ có thể chuyển sang Processing
                    if (newStatus != OrderStatus.Processing)
                    {
                        throw new UserFriendlyException(
                            $"Không thể chuyển từ '{OrderStatus.Received}' sang '{newStatus}'. Chỉ có thể chuyển sang '{OrderStatus.Processing}'.",
                            "INVALID_STATUS_TRANSITION");
                    }
                    break;

                case OrderStatus.Processing:
                    // Processing chỉ có thể chuyển sang Completed
                    if (newStatus != OrderStatus.Completed)
                    {
                        throw new UserFriendlyException(
                            $"Không thể chuyển từ '{OrderStatus.Processing}' sang '{newStatus}'. Chỉ có thể chuyển sang '{OrderStatus.Completed}'.",
                            "INVALID_STATUS_TRANSITION");
                    }
                    break;

                case OrderStatus.Completed:
                    // Completed chỉ có thể chuyển sang Delivered
                    if (newStatus != OrderStatus.Delivered)
                    {
                        throw new UserFriendlyException(
                            $"Không thể chuyển từ '{OrderStatus.Completed}' sang '{newStatus}'. Chỉ có thể chuyển sang '{OrderStatus.Delivered}'.",
                            "INVALID_STATUS_TRANSITION");
                    }
                    break;

                case OrderStatus.Delivered:
                    // Delivered là trạng thái cuối, không thể chuyển sang trạng thái khác
                    throw new UserFriendlyException(
                        $"Đơn hàng đã ở trạng thái '{OrderStatus.Delivered}' và không thể thay đổi trạng thái.",
                        "ORDER_ALREADY_DELIVERED");

                default:
                    // Nếu trạng thái hiện tại là null hoặc không hợp lệ, chỉ cho phép chuyển sang Received
                    if (newStatus != OrderStatus.Received)
                    {
                        throw new UserFriendlyException(
                            $"Đơn hàng có trạng thái không hợp lệ. Vui lòng đặt lại trạng thái thành '{OrderStatus.Received}'.",
                            "INVALID_CURRENT_STATUS");
                    }
                    break;
            }
        }
    }
}


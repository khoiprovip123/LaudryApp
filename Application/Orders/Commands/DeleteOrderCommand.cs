using Domain.Interfaces;
using Domain.Service;
using LHK.Share.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Orders.Commands
{
    public class DeleteOrderCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteOrderCommandHandler : IRequestHandler<DeleteOrderCommand, Unit>
    {
        private readonly IOrderService _orderService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWorkContext _workContext;

        public DeleteOrderCommandHandler(
            IOrderService orderService,
            IHttpContextAccessor httpContextAccessor,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _httpContextAccessor = httpContextAccessor;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
        {
            // Lấy CompanyId từ WorkContext
            var companyId = _workContext?.CompanyId;
            if (companyId == null)
            {
                var ctx = _httpContextAccessor.HttpContext;
                var companyClaim = ctx?.User?.FindFirst("company_id");
                if (companyClaim == null || !Guid.TryParse(companyClaim.Value, out var parsedCompanyId))
                    throw new UserFriendlyException("Không xác định được cửa hàng của người dùng.", "COMPANY_NOT_FOUND");
                companyId = parsedCompanyId;
            }

            // Lấy đơn hàng
            var order = await _orderService.GetByIdAsync(request.Id);
            if (order == null)
                throw new UserFriendlyException("Đơn hàng không tồn tại.", "ORDER_NOT_FOUND");

            // Kiểm tra quyền truy cập theo CompanyId
            if (order.CompanyId != companyId)
                throw new UserFriendlyException("Bạn không có quyền xóa đơn hàng này.", "ORDER_ACCESS_DENIED");

            // Kiểm tra trạng thái thanh toán - chỉ cho phép xóa nếu chưa thanh toán
            if (order.PaymentStatus != null && 
                (order.PaymentStatus.Equals("Paid", StringComparison.OrdinalIgnoreCase) || 
                 order.PaymentStatus.Equals("Đã thanh toán", StringComparison.OrdinalIgnoreCase)))
            {
                throw new UserFriendlyException("Không thể xóa đơn hàng đã thanh toán.", "ORDER_ALREADY_PAID");
            }

            // Kiểm tra RemainingAmount - nếu đã thanh toán một phần hoặc toàn bộ thì không cho xóa
            // Tính RemainingAmount từ OrderItems (nếu có)
            var calculatedTotal = order.OrderItem?.Sum(oi => oi.TotalPrice) ?? order.TotalPrice;
            var remainingAmount = calculatedTotal; // TODO: Tính từ Payment khi có module Payment
            
            // Nếu remainingAmount = 0 nghĩa là đã thanh toán hết
            if (remainingAmount <= 0 && calculatedTotal > 0)
            {
                throw new UserFriendlyException("Không thể xóa đơn hàng đã thanh toán.", "ORDER_ALREADY_PAID");
            }

            // Xóa đơn hàng
            await _orderService.DeleteAsync(order);

            return Unit.Value;
        }
    }
}


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
            var companyId = _workContext?.CompanyId;
            if (companyId == null)
            {
                throw new Exception("Không xác định được cửa hàng của người dùng.");
            }

            var order = await _orderService.SearchQuery(o => o.Id == request.OrderId)
                .Include(o => o.Partner)
                .Include(o => o.OrderItem)
                .Include(o => o.Company)
                .FirstOrDefaultAsync(cancellationToken);

            if (order == null)
            {
                throw new Exception("Đơn hàng không tồn tại.");
            }

            if (order.CompanyId != companyId)
            {
                throw new Exception("Đơn hàng không thuộc cửa hàng này.");
            }

            // Tính tổng tiền
            var totalAmount = order.OrderItem?.Sum(oi => oi.Quantity * oi.UnitPrice) ?? order.TotalPrice;

            // Tính số tiền đã thanh toán
            var paidAmount = await _paymentService.SearchQuery(p => p.OrderId == order.Id)
                .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

            var remainingAmount = totalAmount - paidAmount;

            // Lấy thông tin công ty
            var company = await _companyService.GetByIdAsync(companyId);
            var companyName = company?.CompanyName ?? "";
            var companyPhone = company?.Phone ?? "";

            // Map OrderItems
            var items = order.OrderItem?.Select(oi => new OrderItemPrintDto
            {
                ServiceName = oi.ServiceName,
                Quantity = oi.Quantity,
                UnitOfMeasure = oi.UnitOfMeasure ?? "kg", // Lấy từ OrderItem đã lưu khi tạo đơn hàng
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            }).ToList() ?? new List<OrderItemPrintDto>();

            var result = new OrderPrintDto
            {
                OrderId = order.Id,
                OrderCode = order.Code,
                OrderDate = order.DateCreated,
                PartnerName = order.Partner?.Name ?? "",
                PartnerDisplayName = order.Partner?.DisplayName ?? "",
                PartnerPhone = order.Partner?.Phone ?? "",
                PartnerAddress = order.AddressText ?? "",
                CompanyName = companyName,
                CompanyPhone = companyPhone,
                CompanyAddress = "", // TODO: Thêm địa chỉ vào Company entity nếu cần
                Items = items,
                TotalAmount = totalAmount,
                PaidAmount = paidAmount,
                RemainingAmount = remainingAmount,
                Status = order.Status ?? "",
                PaymentStatus = order.PaymentStatus ?? "",
                Notes = order.Notes ?? "",
                PrintType = request.PrintType
            };

            // Tạo TemplateData dictionary để dễ dàng render template
            result.TemplateData = new Dictionary<string, object>
            {
                { "companyName", result.CompanyName },
                { "companyPhone", result.CompanyPhone },
                { "companyAddress", result.CompanyAddress },
                { "orderCode", result.OrderCode },
                { "orderDate", result.OrderDate },
                { "partnerName", result.PartnerName },
                { "partnerDisplayName", result.PartnerDisplayName },
                { "partnerPhone", result.PartnerPhone },
                { "partnerAddress", result.PartnerAddress },
                { "totalAmount", result.TotalAmount },
                { "paidAmount", result.PaidAmount },
                { "remainingAmount", result.RemainingAmount },
                { "status", result.Status },
                { "paymentStatus", result.PaymentStatus },
                { "notes", result.Notes ?? "" },
                { "printType", result.PrintType },
                { "items", result.Items }
            };

            return result;
        }
    }
}


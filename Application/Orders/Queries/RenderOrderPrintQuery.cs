using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders.Queries
{
    public class RenderOrderPrintQuery : IRequest<PrintTemplatePreviewDto>
    {
        public Guid OrderId { get; set; }
        public string PrintType { get; set; } = "Receive";
        public Guid? TemplateId { get; set; }
    }

    public class RenderOrderPrintQueryHandler : IRequestHandler<RenderOrderPrintQuery, PrintTemplatePreviewDto>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly ICompanyService _companyService;
        private readonly IPrintTemplateService _templateService;
        private readonly IWorkContext _workContext;

        public RenderOrderPrintQueryHandler(
            IOrderService orderService,
            IPaymentService paymentService,
            ICompanyService companyService,
            IPrintTemplateService templateService,
            IWorkContext workContext)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _companyService = companyService;
            _templateService = templateService;
            _workContext = workContext;
        }

        public async Task<PrintTemplatePreviewDto> Handle(RenderOrderPrintQuery request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;
            if (companyId == null)
            {
                throw new Exception("Không xác định được cửa hàng của người dùng.");
            }

            // Lấy template
            Domain.Entity.PrintTemplate template = null;
            if (request.TemplateId.HasValue)
            {
                template = await _templateService.GetByIdAsync(request.TemplateId.Value);
            }
            else
            {
                template = await _templateService.GetActiveTemplateAsync(request.PrintType, companyId);
            }

            if (template == null)
            {
                throw new Exception("Không tìm thấy template để in.");
            }

            // Lấy dữ liệu đơn hàng
            var order = await _orderService.SearchQuery(o => o.Id == request.OrderId)
                .Include(o => o.Partner)
                .Include(o => o.OrderItems)
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
            var totalAmount = order.OrderItems?.Sum(oi => oi.Quantity * oi.UnitPrice) ?? order.TotalPrice;

            // Tính số tiền đã thanh toán
            var paidAmount = await _paymentService.SearchQuery(p => p.OrderId == order.Id)
                .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

            var remainingAmount = totalAmount - paidAmount;

            // Lấy thông tin công ty
            var company = await _companyService.GetByIdAsync(companyId);
            var companyName = company?.CompanyName ?? "";
            var companyPhone = company?.Phone ?? "";

            // Map OrderItems
            var items = order.OrderItems?.Select(oi => new OrderItemPrintDto
            {
                ServiceName = oi.ServiceName,
                Quantity = oi.Quantity,
                UnitOfMeasure = oi.UnitOfMeasure ?? "kg", // Lấy từ OrderItem đã lưu khi tạo đơn hàng
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            }).ToList() ?? new List<OrderItemPrintDto>();

            var orderData = new OrderPrintDto
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
                CompanyAddress = "",
                Items = items,
                TotalAmount = totalAmount,
                PaidAmount = paidAmount,
                RemainingAmount = remainingAmount,
                Status = order.Status ?? "",
                PaymentStatus = order.PaymentStatus ?? "",
                Notes = order.Notes ?? "",
                PrintType = request.PrintType
            };

            // Render template với dữ liệu
            var renderedHtml = RenderTemplate(template.HtmlTemplate, orderData, template.CssStyles);

            return new PrintTemplatePreviewDto
            {
                TemplateId = template.Id,
                TemplateName = template.Name,
                RenderedHtml = renderedHtml
            };
        }

        private string RenderTemplate(string htmlTemplate, OrderPrintDto data, string cssStyles)
        {
            if (string.IsNullOrEmpty(htmlTemplate))
            {
                return "";
            }

            // Tạo dictionary với tất cả các placeholder
            var placeholders = new Dictionary<string, string>
            {
                // Company info
                { "{{companyName}}", data.CompanyName ?? "" },
                { "{{companyPhone}}", data.CompanyPhone ?? "" },
                { "{{companyAddress}}", data.CompanyAddress ?? "" },
                
                // Order info
                { "{{orderCode}}", data.OrderCode ?? "" },
                { "{{orderDate}}", data.OrderDate.ToString("dd/MM/yyyy HH:mm") },
                { "{{orderDateShort}}", data.OrderDate.ToString("dd/MM/yyyy") },
                { "{{orderTime}}", data.OrderDate.ToString("HH:mm") },
                
                // Partner info
                { "{{partnerName}}", data.PartnerName ?? "" },
                { "{{partnerDisplayName}}", data.PartnerDisplayName ?? data.PartnerName ?? "" },
                { "{{partnerPhone}}", data.PartnerPhone ?? "" },
                { "{{partnerAddress}}", data.PartnerAddress ?? "" },
                
                // Amounts
                { "{{totalAmount}}", FormatCurrency(data.TotalAmount) },
                { "{{totalAmountNumber}}", data.TotalAmount.ToString("N0") },
                { "{{paidAmount}}", FormatCurrency(data.PaidAmount) },
                { "{{paidAmountNumber}}", data.PaidAmount.ToString("N0") },
                { "{{remainingAmount}}", FormatCurrency(data.RemainingAmount) },
                { "{{remainingAmountNumber}}", data.RemainingAmount.ToString("N0") },
                
                // Status
                { "{{status}}", data.Status ?? "" },
                { "{{paymentStatus}}", data.PaymentStatus ?? "" },
                { "{{notes}}", data.Notes ?? "" },
                
                // Print type
                { "{{printType}}", data.PrintType == "Receive" ? "NHẬN ĐỒ" : "GIAO ĐỒ" },
                { "{{printTypeLower}}", data.PrintType == "Receive" ? "nhận" : "giao" },
            };

            // Replace placeholders
            var result = htmlTemplate;
            foreach (var placeholder in placeholders)
            {
                result = result.Replace(placeholder.Key, placeholder.Value);
            }

            // Render items table
            result = RenderItemsTable(result, data.Items);

            // Inject CSS
            if (!string.IsNullOrEmpty(cssStyles))
            {
                result = result.Replace("</head>", $"<style>{cssStyles}</style></head>");
                if (!result.Contains("</head>"))
                {
                    result = $"<style>{cssStyles}</style>{result}";
                }
            }

            return result;
        }

        private string RenderItemsTable(string template, List<OrderItemPrintDto> items)
        {
            // Tìm và thay thế {{itemsTable}}
            if (!template.Contains("{{itemsTable}}"))
            {
                return template;
            }

            var itemsHtml = new StringBuilder();
            itemsHtml.AppendLine("<table class='items-table' style='width: 100%; border-collapse: collapse;'>");
            itemsHtml.AppendLine("<thead>");
            itemsHtml.AppendLine("<tr>");
            itemsHtml.AppendLine("<th style='border: 1px solid #ccc; padding: 8px; text-align: left;'>STT</th>");
            itemsHtml.AppendLine("<th style='border: 1px solid #ccc; padding: 8px; text-align: left;'>Dịch vụ</th>");
            itemsHtml.AppendLine("<th style='border: 1px solid #ccc; padding: 8px; text-align: right;'>Số lượng</th>");
            itemsHtml.AppendLine("<th style='border: 1px solid #ccc; padding: 8px; text-align: right;'>Đơn giá</th>");
            itemsHtml.AppendLine("<th style='border: 1px solid #ccc; padding: 8px; text-align: right;'>Thành tiền</th>");
            itemsHtml.AppendLine("</tr>");
            itemsHtml.AppendLine("</thead>");
            itemsHtml.AppendLine("<tbody>");

            foreach (var (item, index) in items.Select((item, index) => (item, index)))
            {
                itemsHtml.AppendLine("<tr>");
                itemsHtml.AppendLine($"<td style='border: 1px solid #ccc; padding: 8px; text-align: center;'>{index + 1}</td>");
                itemsHtml.AppendLine($"<td style='border: 1px solid #ccc; padding: 8px;'>{item.ServiceName}</td>");
                itemsHtml.AppendLine($"<td style='border: 1px solid #ccc; padding: 8px; text-align: right;'>{item.Quantity} {item.UnitOfMeasure}</td>");
                itemsHtml.AppendLine($"<td style='border: 1px solid #ccc; padding: 8px; text-align: right;'>{FormatCurrency(item.UnitPrice)}</td>");
                itemsHtml.AppendLine($"<td style='border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;'>{FormatCurrency(item.TotalPrice)}</td>");
                itemsHtml.AppendLine("</tr>");
            }

            itemsHtml.AppendLine("</tbody>");
            itemsHtml.AppendLine("</table>");

            return template.Replace("{{itemsTable}}", itemsHtml.ToString());
        }

        private string FormatCurrency(decimal amount)
        {
            return new System.Globalization.CultureInfo("vi-VN").NumberFormat.CurrencySymbol + amount.ToString("N0");
        }
    }
}


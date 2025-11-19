using Application.Orders.Queries;
using Application.Reports.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using System.Text;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExportController : BaseApiController
    {
        [HttpGet("orders/excel")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> ExportOrdersToExcel([FromQuery] GetOrdersQuery query)
        {
            // Lấy dữ liệu đơn hàng
            var ordersResult = await Mediator.Send(query);

            // Tạo Excel
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Đơn hàng");

            // Header
            worksheet.Cells[1, 1].Value = "Mã đơn";
            worksheet.Cells[1, 2].Value = "Khách hàng";
            worksheet.Cells[1, 3].Value = "SĐT";
            worksheet.Cells[1, 4].Value = "Tổng tiền";
            worksheet.Cells[1, 5].Value = "Đã thanh toán";
            worksheet.Cells[1, 6].Value = "Còn lại";
            worksheet.Cells[1, 7].Value = "Trạng thái";
            worksheet.Cells[1, 8].Value = "Ngày tạo";

            // Style header
            using (var range = worksheet.Cells[1, 1, 1, 8])
            {
                range.Style.Font.Bold = true;
                range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
            }

            // Data
            int row = 2;
            foreach (var order in ordersResult.Items)
            {
                worksheet.Cells[row, 1].Value = order.Code;
                worksheet.Cells[row, 2].Value = order.PartnerDisplayName ?? order.PartnerName;
                worksheet.Cells[row, 3].Value = order.PartnerPhone ?? "";
                worksheet.Cells[row, 4].Value = order.TotalAmount;
                worksheet.Cells[row, 5].Value = order.PaidAmount;
                worksheet.Cells[row, 6].Value = order.RemainingAmount;
                worksheet.Cells[row, 7].Value = order.Status;
                worksheet.Cells[row, 8].Value = order.DateCreated.ToString("dd/MM/yyyy HH:mm");
                row++;
            }

            // Auto fit columns
            worksheet.Cells.AutoFitColumns();

            // Convert to bytes
            var bytes = package.GetAsByteArray();
            var fileName = $"DonHang_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("revenue/excel")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> ExportRevenueToExcel([FromQuery] GetRevenueReportQuery query)
        {
            // Lấy dữ liệu báo cáo
            var report = await Mediator.Send(query);

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();

            // Sheet Tổng quan
            var summarySheet = package.Workbook.Worksheets.Add("Tổng quan");
            summarySheet.Cells[1, 1].Value = "Từ ngày";
            summarySheet.Cells[1, 2].Value = report.DateFrom.ToString("dd/MM/yyyy");
            summarySheet.Cells[2, 1].Value = "Đến ngày";
            summarySheet.Cells[2, 2].Value = report.DateTo.ToString("dd/MM/yyyy");
            summarySheet.Cells[3, 1].Value = "Tổng doanh thu";
            summarySheet.Cells[3, 2].Value = report.TotalRevenue;
            summarySheet.Cells[4, 1].Value = "Tổng đơn hàng";
            summarySheet.Cells[4, 2].Value = report.TotalOrders;
            summarySheet.Cells[5, 1].Value = "Tổng công nợ";
            summarySheet.Cells[5, 2].Value = report.TotalDebt;

            // Sheet Doanh thu theo dịch vụ
            if (report.RevenueByService.Any())
            {
                var serviceSheet = package.Workbook.Worksheets.Add("Theo dịch vụ");
                serviceSheet.Cells[1, 1].Value = "Dịch vụ";
                serviceSheet.Cells[1, 2].Value = "Doanh thu";
                serviceSheet.Cells[1, 3].Value = "Số lượng";
                serviceSheet.Cells[1, 4].Value = "Số đơn";

                int row = 2;
                foreach (var item in report.RevenueByService)
                {
                    serviceSheet.Cells[row, 1].Value = item.ServiceName;
                    serviceSheet.Cells[row, 2].Value = item.Revenue;
                    serviceSheet.Cells[row, 3].Value = item.Quantity;
                    serviceSheet.Cells[row, 4].Value = item.OrderCount;
                    row++;
                }
                serviceSheet.Cells.AutoFitColumns();
            }

            // Sheet Doanh thu theo khách hàng
            if (report.RevenueByCustomer.Any())
            {
                var customerSheet = package.Workbook.Worksheets.Add("Theo khách hàng");
                customerSheet.Cells[1, 1].Value = "Khách hàng";
                customerSheet.Cells[1, 2].Value = "Doanh thu";
                customerSheet.Cells[1, 3].Value = "Đã thanh toán";
                customerSheet.Cells[1, 4].Value = "Công nợ";
                customerSheet.Cells[1, 5].Value = "Số đơn";

                int row = 2;
                foreach (var item in report.RevenueByCustomer)
                {
                    customerSheet.Cells[row, 1].Value = item.PartnerDisplayName ?? item.PartnerName;
                    customerSheet.Cells[row, 2].Value = item.Revenue;
                    customerSheet.Cells[row, 3].Value = item.PaidAmount;
                    customerSheet.Cells[row, 4].Value = item.DebtAmount;
                    customerSheet.Cells[row, 5].Value = item.OrderCount;
                    row++;
                }
                customerSheet.Cells.AutoFitColumns();
            }

            // Sheet Chi tiết theo ngày
            if (report.DailyDetails.Any())
            {
                var dailySheet = package.Workbook.Worksheets.Add("Chi tiết theo ngày");
                dailySheet.Cells[1, 1].Value = "Ngày";
                dailySheet.Cells[1, 2].Value = "Doanh thu";
                dailySheet.Cells[1, 3].Value = "Số đơn";
                dailySheet.Cells[1, 4].Value = "Đã thanh toán";
                dailySheet.Cells[1, 5].Value = "Còn nợ";

                int row = 2;
                foreach (var item in report.DailyDetails)
                {
                    dailySheet.Cells[row, 1].Value = item.Date.ToString("dd/MM/yyyy");
                    dailySheet.Cells[row, 2].Value = item.Revenue;
                    dailySheet.Cells[row, 3].Value = item.OrderCount;
                    dailySheet.Cells[row, 4].Value = item.PaidOrders;
                    dailySheet.Cells[row, 5].Value = item.DebtOrders;
                    row++;
                }
                dailySheet.Cells.AutoFitColumns();
            }

            var bytes = package.GetAsByteArray();
            var fileName = $"BaoCaoDoanhThu_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
    }
}


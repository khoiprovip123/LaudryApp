using Application.Orders.Commands;
using Application.Orders.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : BaseApiController
    {
        [HttpGet]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetOrders([FromQuery] GetOrdersQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

        [HttpGet("{id}")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var res = await Mediator.Send(new GetOrderByIdQuery { Id = id });
            return Ok(res);
        }

        [Uow]
        [HttpPost]
        [CheckAccess(Actions = Permissions.Orders_Create)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
        {
            var orderId = await Mediator.Send(command);
            return Ok(new { id = orderId });
        }

        [Uow]
        [HttpPut("{id}/status")]
        [CheckAccess(Actions = Permissions.Orders_Update)]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
        {
            if (id != command.OrderId)
                return BadRequest("Id không khớp");

            await Mediator.Send(command);
            return Ok(new { message = "Cập nhật trạng thái đơn hàng thành công." });
        }

        [Uow]
        [HttpDelete("{id}")]
        [CheckAccess(Actions = Permissions.Orders_Delete)]
        public async Task<IActionResult> DeleteOrder(Guid id)
        {
            await Mediator.Send(new DeleteOrderCommand { Id = id });
            return Ok(new { message = "Xóa đơn hàng thành công." });
        }

        [HttpGet("{id}/print")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetOrderPrint(Guid id, [FromQuery] string printType = "Receive", [FromQuery] Guid? templateId = null)
        {
            // Nếu có templateId, render với template
            if (templateId.HasValue)
            {
                var res = await Mediator.Send(new Application.Orders.Queries.GetOrderPrintWithTemplateQuery
                {
                    OrderId = id,
                    PrintType = printType,
                    TemplateId = templateId
                });
                return Ok(res);
            }

            // Nếu không có templateId, trả về dữ liệu raw
            var res2 = await Mediator.Send(new Application.Orders.Queries.GetOrderPrintQuery 
            { 
                OrderId = id, 
                PrintType = printType 
            });
            return Ok(res2);
        }
    }
}


 using Application.Orders.Commands;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemsController : BaseApiController
    {
        [Uow]
        [HttpPut("{orderItemId}")]
        [CheckAccess(Actions = Permissions.Orders_Update)]
        public async Task<IActionResult> UpdateOrderItem(Guid orderItemId, [FromBody] UpdateOrderItemCommand command)
        {
            if (orderItemId != command.OrderItemId)
                return BadRequest("Id không khớp");

            await Mediator.Send(command);
            return Ok(new { message = "Cập nhật chi tiết dịch vụ thành công." });
        }
    }
}


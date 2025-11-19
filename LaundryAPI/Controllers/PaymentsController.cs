using Application.Payments.Commands;
using Application.Payments.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : BaseApiController
    {
        [HttpGet]
        [CheckAccess(Actions = Permissions.Payments_View)]
        public async Task<IActionResult> GetPayments([FromQuery] GetPaymentsQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

        [HttpGet("{id}")]
        [CheckAccess(Actions = Permissions.Payments_View)]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var res = await Mediator.Send(new GetPaymentByIdQuery { Id = id });
            return Ok(res);
        }

        [Uow]
        [HttpPost]
        [CheckAccess(Actions = Permissions.Payments_Create)]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command)
        {
            var paymentId = await Mediator.Send(command);
            return Ok(new { id = paymentId });
        }

        [Uow]
        [HttpDelete("{id}")]
        [CheckAccess(Actions = Permissions.Payments_Delete)]
        public async Task<IActionResult> DeletePayment(Guid id)
        {
            await Mediator.Send(new DeletePaymentCommand { Id = id });
            return Ok(new { message = "Xóa thanh toán thành công." });
        }
    }
}


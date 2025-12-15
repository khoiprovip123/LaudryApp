using Application.OrderPayment.Queries;
using Application.Payments.Commands;
using Application.Payments.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentOrdersController : BaseApiController
    {
        [HttpGet]
        [CheckAccess(Actions = Permissions.Payments_View)]
        public async Task<IActionResult> GetOrderPaymentByOrderId([FromQuery] GetOrderPaymentByIdQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }
    }
}


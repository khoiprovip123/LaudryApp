using Application.Customers.Queries;
using Application.Parner.Commands;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartnersController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetCustomers([FromQuery] GetPageParnerQuery query)
        {
           var res = await Mediator.Send(query);
            return Ok(res);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePartner([FromQuery] CreatePartnerCommand command)
        {
            var res = await Mediator.Send(command);
            return Ok(res);
        }

    }
}

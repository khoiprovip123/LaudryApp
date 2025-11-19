using Application.Reports.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : BaseApiController
    {
        [HttpGet("revenue")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetRevenueReport([FromQuery] GetRevenueReportQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }
    }
}


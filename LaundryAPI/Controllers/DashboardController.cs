using Application.Dashboard.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : BaseApiController
    {
        [HttpGet("stats")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetDashboardStats([FromQuery] GetDashboardStatsQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetCountOrdersToday([FromQuery] GetCountOrdersTodayByStatusQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetRevenueForTheDay([FromQuery] GetRevenueForTheDayQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

    }
}


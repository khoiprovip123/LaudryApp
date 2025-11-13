using Application.Services.Queries;
using Application.Services.Commands;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ServicesController : BaseApiController
	{
		[HttpGet]
		public async Task<IActionResult> GetServices([FromQuery] GetPageServiceQuery query)
		{
			var res = await Mediator.Send(query);
			return Ok(res);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetServiceById(Guid id)
		{
			var res = await Mediator.Send(new GetServiceByIdQuery { Id = id });
			return Ok(res);
		}

		[Uow]
		[HttpPost]
		public async Task<IActionResult> CreateService([FromBody] CreateServiceCommand command)
		{
			var res = await Mediator.Send(command);
			return Ok(res);
		}

		[Uow]
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateService(Guid id, [FromBody] UpdateServiceCommand command)
		{
			if (id != command.Id) return BadRequest("Id không khớp");
			var res = await Mediator.Send(command);
			return Ok(res);
		}

		[Uow]
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteService(Guid id)
		{
			var res = await Mediator.Send(new DeleteServiceCommand { Id = id });
			return Ok(res);
		}
	}
}


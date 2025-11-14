using Application.Partners.Queries;
using Application.Partners.Commands;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartnersController : BaseApiController
    {
        [HttpGet]
		public async Task<IActionResult> GetPartners([FromQuery] GetPagePartnerQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

		[HttpGet("{id}")]
		public async Task<IActionResult> GetPartnerById(Guid id)
		{
			var res = await Mediator.Send(new GetPartnerByIdQuery { Id = id });
			return Ok(res);
		}

        [HttpGet("[action]")]
        public async Task<IActionResult> GetPartnerByCompanyId(Guid id)
        {
            var res = await Mediator.Send(new GetPartnerByIdQuery { Id = id });
            return Ok(res);
        }

        [Uow]
        [HttpPost]
		public async Task<IActionResult> CreatePartnerCustomer([FromBody] CreatePartnerCommand command)
        {
            var res = await Mediator.Send(command);
            return Ok(res);
        }

		[Uow]
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdatePartner(Guid id, [FromBody] UpdatePartnerCommand command)
		{
			if (id != command.Id) return BadRequest("Id không khớp");
			var res = await Mediator.Send(command);
			return Ok(res);
		}

		[Uow]
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeletePartner(Guid id)
		{
			var res = await Mediator.Send(new DeletePartnerCommand { Id = id });
			return Ok(res);
		}

    }
}

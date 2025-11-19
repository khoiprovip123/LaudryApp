using Application.PrintTemplates.Commands;
using Application.PrintTemplates.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrintTemplatesController : BaseApiController
    {
        [HttpGet]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetPrintTemplates([FromQuery] string? templateType = null)
        {
            var res = await Mediator.Send(new GetPrintTemplatesQuery { TemplateType = templateType });
            return Ok(res);
        }

        [HttpGet("{id}")]
        [CheckAccess(Actions = Permissions.Orders_View)]
        public async Task<IActionResult> GetPrintTemplateById(Guid id)
        {
            var res = await Mediator.Send(new GetPrintTemplateByIdQuery { Id = id });
            return Ok(res);
        }

        [Uow]
        [HttpPost]
        [CheckAccess(Actions = Permissions.Orders_Update)]
        public async Task<IActionResult> CreatePrintTemplate([FromBody] CreatePrintTemplateCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { id });
        }

        [Uow]
        [HttpPut("{id}")]
        [CheckAccess(Actions = Permissions.Orders_Update)]
        public async Task<IActionResult> UpdatePrintTemplate(Guid id, [FromBody] UpdatePrintTemplateCommand command)
        {
            if (id != command.Id)
                return BadRequest("Id không khớp");
            await Mediator.Send(command);
            return Ok(new { message = "Cập nhật template thành công." });
        }

        [Uow]
        [HttpDelete("{id}")]
        [CheckAccess(Actions = Permissions.Orders_Update)]
        public async Task<IActionResult> DeletePrintTemplate(Guid id)
        {
            await Mediator.Send(new DeletePrintTemplateCommand { Id = id });
            return Ok(new { message = "Xóa template thành công." });
        }
    }
}


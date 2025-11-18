using Application.PermissionGroups.Commands;
using Application.PermissionGroups.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireCompany] // Yêu cầu user phải thuộc về một company (trừ SuperAdmin)
    public class PermissionGroupsController : BaseApiController
    {
        [HttpGet]
        [CheckAccess(Actions = Permissions.Companies_View)]
        public async Task<IActionResult> GetPermissionGroups([FromQuery] GetPagePermissionGroupQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [CheckAccess(Actions = Permissions.Companies_View)]
        public async Task<IActionResult> GetPermissionGroupById(Guid id, [FromQuery] bool includeEmployees = true)
        {
            var result = await Mediator.Send(new GetPermissionGroupByIdQuery { Id = id, IncludeEmployees = includeEmployees });
            return Ok(result);
        }

        [HttpGet("{id}/employees")]
        [CheckAccess(Actions = Permissions.Companies_View)]
        public async Task<IActionResult> GetEmployeesByPermissionGroup(Guid id)
        {
            var result = await Mediator.Send(new GetEmployeesByPermissionGroupQuery { PermissionGroupId = id });
            return Ok(result);
        }

        [UowAttribute]
        [HttpPost]
        [CheckAccess(Actions = Permissions.Companies_Create)]
        public async Task<IActionResult> CreatePermissionGroup([FromBody] CreatePermissionGroupCommand command)
        {
            var result = await Mediator.Send(command);
            return Ok(new { id = result });
        }

        [Uow]
        [HttpPut("{id}")]
        [CheckAccess(Actions = Permissions.Companies_Update)]
        public async Task<IActionResult> UpdatePermissionGroup(Guid id, [FromBody] UpdatePermissionGroupCommand command)
        {
            if (id != command.Id) return BadRequest("Id không khớp");
            await Mediator.Send(command);
            return Ok();
        }

        [Uow]
        [HttpDelete("{id}")]
        [CheckAccess(Actions = Permissions.Companies_Delete)]
        public async Task<IActionResult> DeletePermissionGroup(Guid id)
        {
            await Mediator.Send(new DeletePermissionGroupCommand { Id = id });
            return Ok();
        }

        [Uow]
        [HttpPost("{id}/employees")]
        [CheckAccess(Actions = Permissions.Companies_Update)]
        public async Task<IActionResult> AddEmployeesToPermissionGroup(Guid id, [FromBody] AddEmployeesToPermissionGroupCommand command)
        {
            if (id != command.PermissionGroupId) return BadRequest("Id không khớp");
            await Mediator.Send(command);
            return Ok();
        }

        [Uow]
        [HttpDelete("{id}/employees")]
        [CheckAccess(Actions = Permissions.Companies_Update)]
        public async Task<IActionResult> RemoveEmployeesFromPermissionGroup(Guid id, [FromBody] RemoveEmployeesFromPermissionGroupCommand command)
        {
            if (id != command.PermissionGroupId) return BadRequest("Id không khớp");
            await Mediator.Send(command);
            return Ok();
        }
    }
}


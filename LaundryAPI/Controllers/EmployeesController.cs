using Application.Employees.Commands;
using Application.Employees.Queries;
using LaundryAPI.Attributes;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireCompany] // Yêu cầu user phải thuộc về một company (trừ SuperAdmin)
    public class EmployeesController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetEmployees([FromQuery] GetPageEmployeeQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployeeById(Guid id)
        {
            var result = await Mediator.Send(new GetEmployeeByIdQuery { Id = id });
            return Ok(result);
        }

        [UowAttribute]
        [HttpPost]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeCommand command)
        {
            var result = await Mediator.Send(command);
            return Ok(new { id = result });
        }

        [Uow]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] UpdateEmployeeCommand command)
        {
            if (id != command.Id) return BadRequest("Id không khớp");
            await Mediator.Send(command);
            return Ok();
        }

        [Uow]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(Guid id)
        {
            await Mediator.Send(new DeleteEmployeeCommand { Id = id });
            return Ok();
        }
    }
}


using Application.Companies.Commands;
using Application.Companies.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using LaundryAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : BaseApiController
    {
        [HttpGet]
        [RequireSuperAdmin] // Chỉ SuperAdmin mới xem được danh sách cửa hàng
        public async Task<IActionResult> GetCompanies([FromQuery] GetPageCompanyQuery query)
        {
            var res = await Mediator.Send(query);
            return Ok(res);
        }

        [HttpGet("{id}")]
        [RequireSuperAdmin] // Chỉ SuperAdmin mới xem được chi tiết cửa hàng
        public async Task<IActionResult> GetCompanyById(Guid id)
        {
            var res = await Mediator.Send(new GetCompanyByIdQuery { Id = id });
            return Ok(res);
        }

        [UowAttribute]
        [HttpPost]
        [RequireSuperAdmin] // Chỉ SuperAdmin mới tạo được cửa hàng
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command)
        {
            var res = await Mediator.Send(command);
            return Ok(res);
        }

        [Uow]
        [HttpPut("{id}")]
        [RequireSuperAdmin] // Chỉ SuperAdmin mới cập nhật được cửa hàng
        public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyCommand command)
        {
            if (id != command.Id) return BadRequest("Id không khớp");
            var res = await Mediator.Send(command);
            return Ok(res);
        }

        [Uow]
        [HttpDelete("{id}")]
        [RequireSuperAdmin] // Chỉ SuperAdmin mới xóa được cửa hàng
        public async Task<IActionResult> DeleteCompany(Guid id)
        {
            var res = await Mediator.Send(new DeleteCompanyCommand { Id = id });
            return Ok(res);
        }
    }
}

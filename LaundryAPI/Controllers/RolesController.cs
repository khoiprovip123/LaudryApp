using Application.DTOs;
using Application.Roles.Queries;
using Domain.Constants;
using LaundryAPI.Attributes;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : BaseApiController
    {
        [HttpGet("permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            var result = await Mediator.Send(new GetAllPermissionsQuery());
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            var result = await Mediator.Send(new GetAllRolesQuery());
            return Ok(result);
        }

        [HttpGet("{roleName}/permissions")]
        public async Task<IActionResult> GetRolePermissions(string roleName)
        {
            var roles = await Mediator.Send(new GetAllRolesQuery());
            var role = roles.FirstOrDefault(r => r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase));
            
            if (role == null)
                return NotFound(new { message = $"Role '{roleName}' không tồn tại" });

            return Ok(role.Permissions);
        }
    }
}


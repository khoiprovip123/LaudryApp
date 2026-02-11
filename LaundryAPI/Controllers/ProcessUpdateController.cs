using Domain;
using Domain.Constants;
using Domain.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcessUpdateController : ControllerBase
    {
        private readonly ICatalogDbContextMigrationService _migrationService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ILogger<ProcessUpdateController> _logger;

        public ProcessUpdateController(
            ICatalogDbContextMigrationService migrationService,
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ILogger<ProcessUpdateController> logger)
        {
            _migrationService = migrationService;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        [HttpPost("UpdateMigrations")]
        public async Task<IActionResult> UpdateMigrations()
        {
            try
            {
                _logger.LogInformation("Bắt đầu update migrations...");
                await _migrationService.MigrationAsync();
                _logger.LogInformation("Update migrations thành công");
                
                return Ok(new { 
                    success = true, 
                    message = "Update migrations thành công" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi update migrations: {Message}", ex.Message);
                return StatusCode(500, new { 
                    success = false, 
                    message = "Lỗi khi update migrations", 
                    error = ex.Message 
                });
            }
        }

        public class CreateAdminRequest
        {
            public string? UserName { get; set; }
            public string? Password { get; set; }
            public string? Email { get; set; }
        }

        [AllowAnonymous]
        [HttpPost("CreateAdmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest? request)
        {
            var userName = string.IsNullOrWhiteSpace(request?.UserName) ? "admin" : request!.UserName!.Trim();
            var password = string.IsNullOrWhiteSpace(request?.Password) ? "123123" : request!.Password!;
            var email = string.IsNullOrWhiteSpace(request?.Email) ? "admin@local" : request!.Email!.Trim();

            var existingUser = await _userManager.FindByNameAsync(userName);
            if (existingUser != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Tài khoản admin đã tồn tại",
                    userName
                });
            }

            var user = new ApplicationUser
            {
                UserName = userName,
                Email = email,
                EmailConfirmed = true,
                Active = true,
                IsSuperAdmin = false,
                IsUserRoot = false
            };

            var createResult = await _userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không thể tạo tài khoản admin",
                    errors = createResult.Errors.Select(e => e.Description).ToList()
                });
            }

            if (!await _roleManager.RoleExistsAsync(Roles.Admin))
            {
                var roleCreate = await _roleManager.CreateAsync(new ApplicationRole { Name = Roles.Admin });
                if (!roleCreate.Succeeded)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Không thể tạo role Admin",
                        errors = roleCreate.Errors.Select(e => e.Description).ToList()
                    });
                }
            }

            var roleResult = await _userManager.AddToRoleAsync(user, Roles.Admin);
            if (!roleResult.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không thể gán role Admin",
                    errors = roleResult.Errors.Select(e => e.Description).ToList()
                });
            }

            return Ok(new
            {
                success = true,
                message = "Tạo tài khoản admin thành công",
                userName
            });
        }
    }
}


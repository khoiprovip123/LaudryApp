using Domain;
using Microsoft.AspNetCore.Mvc;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcessUpdateController : ControllerBase
    {
        private readonly ICatalogDbContextMigrationService _migrationService;
        private readonly ILogger<ProcessUpdateController> _logger;

        public ProcessUpdateController(
            ICatalogDbContextMigrationService migrationService,
            ILogger<ProcessUpdateController> logger)
        {
            _migrationService = migrationService;
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
    }
}


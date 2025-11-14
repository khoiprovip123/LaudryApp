using Domain;
using Infrastucture.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastucture
{
    public class LaundryDbContextMigrationService : ICatalogDbContextMigrationService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<LaundryDbContextMigrationService> _logger;

        public LaundryDbContextMigrationService(
            IServiceProvider serviceProvider,
            ILogger<LaundryDbContextMigrationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task MigrationAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LaundryDbContext>();

                try
                {
                    await dbContext.Database.MigrateAsync();
                    _logger.LogInformation("Migrate database success");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Migrate database failed: {Message}", ex.Message);
                    throw;
                }
            }
        }
    }
}


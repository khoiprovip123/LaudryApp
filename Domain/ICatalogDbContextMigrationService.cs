using System.Threading.Tasks;

namespace Domain;
public interface ICatalogDbContextMigrationService
{
    Task MigrationAsync();
}

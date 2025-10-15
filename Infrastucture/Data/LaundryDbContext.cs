using Domain.Entity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastucture.Data
{
    public class LaundryDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
      //  public LaundryDbContext(DbContextOptions<LaundryDbContext> options) : base(options) { }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }

    }

    //public class CatalogDbContextDesignFactory : IDesignTimeDbContextFactory<LaundryDbContext>
    //{
    //    public LaundryDbContext CreateDbContext(string[] args)
    //    {
    //        var optionsBuilder = new DbContextOptionsBuilder<LaundryDbContext>()
    //            .UseSqlServer("Server=.\\;User Id=sa;Password=123123;Initial Catalog=LaundryDB;");

    //        return new LaundryDbContext(optionsBuilder.Options);
    //    }
    //}
}

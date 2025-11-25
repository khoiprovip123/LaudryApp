using Domain.Entity;
using Domain.Interfaces;
using Infrastucture.EntityConfigurations;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Infrastucture.Data
{
    public class LaundryDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IDbContext
    {
        private readonly IConfiguration _configuration;

        //public LaundryDbContext(IConfiguration configuration)
        //{
        //    _configuration = configuration;
        //}

        public LaundryDbContext(DbContextOptions<LaundryDbContext> options) : base(options) { }


        //Cho phép gọi hàm SQL trong LINQ an toàn, tối ưu
        [DbFunction("DATEPART", IsBuiltIn = true)]
        public static int? DatePart(string datePartArg, DateTime? date)
            => throw new NotSupportedException();



        #region DBSets
        public DbSet<Company> Companies { get; set; }
        public DbSet<Partner> Partners { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
		public DbSet<IRSequence> IRSequences { get; set; }
        public DbSet<PermissionGroup> PermissionGroups { get; set; }
        public DbSet<EmployeePermissionGroup> EmployeePermissionGroups { get; set; }
        public DbSet<PrintTemplate> PrintTemplates { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfiguration(new ApplicationUserConfiguration());
            builder.ApplyConfiguration(new OrderConfiguration());
            builder.ApplyConfiguration(new OrderItemConfiguration());
            builder.ApplyConfiguration(new CompanyConfiguration());
            builder.ApplyConfiguration(new PartnerConfiguration());
            builder.ApplyConfiguration(new ServiceConfiguration());
            builder.ApplyConfiguration(new PaymentConfiguration());
			builder.ApplyConfiguration(new IRSequenceConfiguration());
            builder.ApplyConfiguration(new PermissionGroupConfiguration());
            builder.ApplyConfiguration(new EmployeePermissionGroupConfiguration());
            builder.ApplyConfiguration(new PrintTemplateConfiguration());

            base.OnModelCreating(builder);
        }

        public Task<int> ExecuteSqlCommandAsync(string sql, params object[] parameters)
        {
            return Database.ExecuteSqlRawAsync(sql, parameters);
        }
    }

    public class CatalogDbContextDesignFactory : IDesignTimeDbContextFactory<LaundryDbContext>
    {
        public LaundryDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<LaundryDbContext>()
                .UseSqlServer("Server=.\\;User Id=sa;Password=123123;Initial Catalog=LaundryDB; Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;");

            return new LaundryDbContext(optionsBuilder.Options);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastucture.Data
{
    public class LaundryDbContext : DbContext
    {
        public LaundryDbContext(DbContextOptions<LaundryDbContext> options) : base(options) { }
    }

    public class CatalogDbContextDesignFactory : IDesignTimeDbContextFactory<LaundryDbContext>
    {
        public LaundryDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<LaundryDbContext>()
                .UseSqlServer("Server=.\\;User Id=sa;Password=123123;Initial Catalog=LaundryDB;");

            return new LaundryDbContext(optionsBuilder.Options);
        }
    }
}

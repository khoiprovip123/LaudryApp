using Infrastucture.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastucture.Data
{

    public sealed class DbContextProvider<LaundryDbContext> : IDbContextProvider<LaundryDbContext>
        where LaundryDbContext : DbContext
    {
        private readonly LaundryDbContext _dbContext;

        public DbContextProvider(LaundryDbContext dbContext) => _dbContext = dbContext;

        public LaundryDbContext GetDbContext() => _dbContext;

        public Task<LaundryDbContext> GetDbContextAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(_dbContext);
    }
}

using Domain.Interfaces;
using Infrastucture.Data;
using Infrastucture.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastucture.Repository
{
    public class EfUnitOfWork : IUnitOfWork
    {
        private readonly IDbContextProvider<LaundryDbContext> _dbContextProvider;
        private IDbContextTransaction _transaction;

        public EfUnitOfWork(IDbContextProvider<LaundryDbContext> dbContextProvider)
        {
            _dbContextProvider = dbContextProvider;
        }

        public async Task BeginTransactionAsync()
        {
            var db = await _dbContextProvider.GetDbContextAsync();
            _transaction = await db.Database.BeginTransactionAsync();
        }

        public async Task CommitAsync()
        {
            var db = await _dbContextProvider.GetDbContextAsync();
            await db.SaveChangesAsync();
            await _transaction.CommitAsync();
        }

        public async Task RollbackAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

}

using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastucture.Interfaces
{
    public interface IDbContextProvider<TContext> where TContext : IDisposable
    {
        TContext GetDbContext();
        Task<TContext> GetDbContextAsync(CancellationToken cancellationToken = default);
    }
}

using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IAsyncRepository<T> : IRepository<T> where T : class
    {
        Task<T> GetByIdAsync(object id);
        Task<IReadOnlyList<T>> ListAllAsync();
        Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec);
        Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec, Func<IQueryable<T>, IOrderedQueryable<T>> sort = null,
            string includes = "",
            int offset = 0, int limit = int.MaxValue, bool isPagingEnabled = true);
        Task<T> FirstOrDefaultAsync(ISpecification<T> spec, Func<IQueryable<T>, IOrderedQueryable<T>> sort = null,
            string includes = "");
        Task<T> InsertAsync(T entity);
        Task<IEnumerable<T>> InsertAsync(IEnumerable<T> entities, bool autoSave = true);

        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities, bool autoSave = true);
        Task DeleteAsync(T entity);
        Task DeleteAsync(IEnumerable<T> entities, bool autoSave = true);
        Task<int> CountAsync(ISpecification<T> spec);
        Task<int> ExcuteSqlCommandAsync(string sql, params object[] parameters);

        Task<IList<T>> BulkInsertAsync(IList<T> entities);
        Task<IList<T>> BulkInsertIncludeGraphAsync(IList<T> entities);

        Task BulkInsertOrUpdateAsync(IList<T> entities);

        Task BulkUpdateAsync(IList<T> entities);

        Task BulkDeleteAsync(IList<T> entities);

        Task<IList<T>> BulkSearchAsync(IList<T> items, string fieldName);

        IDbContext DbContext { get; }

        Task EnsureCollectionLoadedAsync<TProperty>(T entity, Expression<Func<T, IEnumerable<TProperty>>> propertyExpression, CancellationToken cancellationToken = default) where TProperty : class;

        Task EnsurePropertyLoadedAsync<TProperty>(T entity, Expression<Func<T, TProperty>> propertyExpression, CancellationToken cancellationToken = default) where TProperty : class;

    }
}

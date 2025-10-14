using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public partial interface IRepository<T> where T : class
    {
        /// <summary>
        /// Get entity by identifier
        /// </summary>
        /// <param name="id">Identifier</param>
        /// <returns>Entity</returns>
        T GetById(params object[] keyValues);

        /// <summary>
        /// Insert entity
        /// </summary>
        /// <param name="entity">Entity</param>
        T Insert(T entity);

        /// <summary>
        /// Update entity
        /// </summary>
        /// <param name="entity">Entity</param>
        void Update(T entity);

        /// <summary>
        /// Delete entity
        /// </summary>
        /// <param name="entity">Entity</param>
        void Delete(T entity);

        IQueryable<T> SearchQuery(Expression<Func<T, bool>> domain = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, int offSet = 0, int limit = 0,
            bool isPagingEnabled = false);

        IEnumerable<T> SqlQuery(string sql, params object[] parameters);

        EntityEntry<T> GetEntry(T entity);

        IQueryable<T> SearchQuery(ISpecification<T> spec, Func<IQueryable<T>, IOrderedQueryable<T>> sort = null,
          string includes = "",
          int offset = 0, int limit = 0, bool isPagingEnabled = false);
 

        Task<List<T>> SearchAsync(Expression<Func<T, bool>> domain = null, int offSet = 0, int limit = int.MaxValue);

        IQueryable<T> Table { get; }
    }
}

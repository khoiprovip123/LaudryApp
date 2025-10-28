using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Application.Service
{
    public interface IBaseService<T> where T : BaseEntity
    {

        T GetById(object id);
        Task<T> GetByIdAsync(object id);

        Task<IEnumerable<T>> GetList(IEnumerable<Guid> ids, int limit = 200);

        T Create(T entity);
        Task<T> CreateAsync(T entity);
        Task<IEnumerable<T>> CreateAsync(IEnumerable<T> entities);

        /// <summary>
        /// Update entity
        /// </summary>
        /// <param name="entity">Entity</param>
        void Update(T entity);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);

        /// <summary>
        /// Delete entity
        /// </summary>
        /// <param name="entity">Entity</param>
        void Delete(T entity);
        Task DeleteAsync(T entity);
        Task DeleteAsync(IEnumerable<T> entities);

        public IQueryable<T> SearchQuery(Expression<Func<T, bool>> domain = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, int offSet = 0, int limit = 0,
            bool isPagingEnabled = false);

        Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec);

        IEnumerable<T> SqlQuery(string sql, params object[] parameters);

    }
}

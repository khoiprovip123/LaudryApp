using Domain.Entity;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class BaseService<TEntity> : IBaseService<TEntity> where TEntity : BaseEntity
    {
        private readonly IAsyncRepository<TEntity> _repository;
        protected readonly IHttpContextAccessor _httpContextAccessor;

        public BaseService(IAsyncRepository<TEntity> repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }

        protected T GetService<T>()
        {
            return (T)_httpContextAccessor.HttpContext?.RequestServices.GetService(typeof(T));
        }

        public TEntity Create(TEntity entity)
        {
            _repository.Insert(entity);
            return entity;
        }

        public virtual async Task<TEntity> CreateAsync(TEntity entity)
        {
            await CreateAsync(new List<TEntity>() { entity });
            return entity;
        }

        public virtual async Task<IEnumerable<TEntity>> CreateAsync(IEnumerable<TEntity> entities)
        {
            if (!entities.Any())
                return entities;

            await _repository.InsertAsync(entities, autoSave: false);

            await _repository.DbContext.SaveChangesAsync();

            return entities;
        }

        public void Delete(TEntity entity)
        {
            _repository.Delete(entity);
        }

        public virtual async Task DeleteAsync(TEntity entity)
        {
            await DeleteAsync(new List<TEntity>() { entity });
        }

        public virtual async Task DeleteAsync(IEnumerable<TEntity> entities)
        {
            await _repository.DeleteAsync(entities, false);
            await _repository.DbContext.SaveChangesAsync();
        }

        public Task<int> ExcuteSqlCommandAsync(string sql, params object[] parameters)
        {
            throw new NotImplementedException();
        }

        public TEntity GetById(object id)
        {
            return _repository.GetById(id);
        }

        public virtual async Task<TEntity> GetByIdAsync(object id)
        {
            if (id is string)
                id = Guid.Parse(id.ToString());
            return await _repository.GetByIdAsync(id);
        }

        public EntityEntry<TEntity> GetEntry(TEntity entity)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<TEntity>> GetList(IEnumerable<Guid> ids, int limit = 200)
        {
            var ids_distinct = ids.Distinct().ToList();

            var offset = 0;
            var sub_ids = ids_distinct.Skip(offset).Take(limit).ToList();
            var res = new List<TEntity>();
            while (sub_ids.Count > 0)
            {
                var items = await SearchQuery(x => sub_ids.Contains(x.Id)).ToListAsync();
                res.AddRange(items);

                offset += limit;
                sub_ids = ids_distinct.Skip(offset).Take(limit).ToList();
            }

            return res;
        }

        public async Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity> spec)
        {
            return await _repository.ListAsync(spec);
        }

        public IQueryable<TEntity> SearchQuery(Expression<Func<TEntity, bool>> domain = null, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null, int offSet = 0, int limit = 0,
        bool isPagingEnabled = false)
        {
            //CheckAccessRights(typeof(TEntity).Name, "Read");
            ISpecification<TEntity> spec = new InitialSpecification<TEntity>(x => true);
            if (domain != null)
                spec = new InitialSpecification<TEntity>(domain);

            return _repository.SearchQuery(domain: spec.AsExpression(), orderBy: orderBy, offSet: offSet, limit: limit, isPagingEnabled: isPagingEnabled);
        }

        public IEnumerable<TEntity> SqlQuery(string sql, params object[] parameters)
        {
            throw new NotImplementedException();
        }

        public void Update(TEntity entity)
        {
            _repository.Update(entity);
        }

        public virtual async Task UpdateAsync(TEntity entity)
        {
            await UpdateAsync(new List<TEntity>() { entity });
        }

        public virtual async Task UpdateAsync(IEnumerable<TEntity> entities)
        {
            if (!entities.Any())
                return;

            await _repository.UpdateAsync(entities, autoSave: false);


            await _repository.DbContext.SaveChangesAsync();

        }
    }
}

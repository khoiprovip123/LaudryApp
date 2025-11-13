using Infrastucture.Data;
using Infrastucture.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Domain.Interfaces;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Infrastucture.Repository
{
    public class EfRepository<T> : IAsyncRepository<T> where T : class
    {
        private readonly IDbContextProvider<LaundryDbContext> _provider;
        private LaundryDbContext Db => _provider.GetDbContext();

        public IDbContext DbContext => Db;

        public IQueryable<T> Table => Db.Set<T>();

        public EfRepository(IDbContextProvider<LaundryDbContext> provider) => _provider = provider;

        public Task<T?> FindAsync(params object[] keys)
            => Db.Set<T>().FindAsync(keys).AsTask();

        public IQueryable<T> QueryNoTracking()
            => Db.Set<T>().AsNoTracking();

        public async Task<T> GetByIdAsync(object id)
        {
            var entity = await Db.Set<T>().FindAsync(id);
            return entity!;
        }

        public Task<IReadOnlyList<T>> ListAllAsync()
            => Db.Set<T>().AsNoTracking().ToListAsync().ContinueWith(t => (IReadOnlyList<T>)t.Result);

        public Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec)
            => ApplySpecification(spec).AsNoTracking().ToListAsync().ContinueWith(t => (IReadOnlyList<T>)t.Result);

        public Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec, Func<IQueryable<T>, IOrderedQueryable<T>> sort = null, string includes = "", int offset = 0, int limit = int.MaxValue, bool isPagingEnabled = true)
        {
            var query = ApplySpecification(spec).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(includes))
            {
                foreach (var inc in includes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    query = query.Include(inc);
            }

            if (sort != null)
                query = sort(query);

            if (isPagingEnabled && limit > 0)
                query = query.Skip(offset).Take(limit);

            return query.ToListAsync().ContinueWith(t => (IReadOnlyList<T>)t.Result);
        }

        public async Task<T> FirstOrDefaultAsync(ISpecification<T> spec, Func<IQueryable<T>, IOrderedQueryable<T>> sort = null, string includes = "")
        {
            var query = ApplySpecification(spec).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(includes))
            {
                foreach (var inc in includes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    query = query.Include(inc);
            }

            if (sort != null)
                query = sort(query);

            return await query.FirstOrDefaultAsync();
        }

        public async Task<T> InsertAsync(T entity)
        {
            await Db.Set<T>().AddAsync(entity);
            await Db.SaveChangesAsync();
            return entity;
        }

        public async Task<IEnumerable<T>> InsertAsync(IEnumerable<T> entities, bool autoSave = true)
        {
            await Db.Set<T>().AddRangeAsync(entities);
            if (autoSave) await Db.SaveChangesAsync();
            return entities;
        }

        public async Task UpdateAsync(T entity)
        {
            Db.Set<T>().Update(entity);
            await Db.SaveChangesAsync();
        }

        public async Task UpdateAsync(IEnumerable<T> entities, bool autoSave = true)
        {
            Db.Set<T>().UpdateRange(entities);
            if (autoSave) await Db.SaveChangesAsync();
        }

        public async Task DeleteAsync(T entity)
        {
            Db.Set<T>().Remove(entity);
            await Db.SaveChangesAsync();
        }

        public async Task DeleteAsync(IEnumerable<T> entities, bool autoSave = true)
        {
            Db.Set<T>().RemoveRange(entities);
            if (autoSave) await Db.SaveChangesAsync();
        }

        public Task<int> CountAsync(ISpecification<T> spec)
            => ApplySpecification(spec).CountAsync();

        public Task<int> ExcuteSqlCommandAsync(string sql, params object[] parameters)
            => Db.Database.ExecuteSqlRawAsync(sql, parameters);

        public async Task<IList<T>> BulkInsertAsync(IList<T> entities)
        {
            await Db.Set<T>().AddRangeAsync(entities);
            await Db.SaveChangesAsync();
            return entities;
        }

        public async Task<IList<T>> BulkInsertIncludeGraphAsync(IList<T> entities)
        {
            await Db.Set<T>().AddRangeAsync(entities);
            await Db.SaveChangesAsync();
            return entities;
        }

        public async Task BulkInsertOrUpdateAsync(IList<T> entities)
        {
            // Đơn giản: cố gắng Attach; nếu Detached -> Add, nếu tồn tại -> Update
            foreach (var e in entities)
            {
                var entry = Db.Entry(e);
                if (entry.State == EntityState.Detached)
                    await Db.Set<T>().AddAsync(e);
                else
                    entry.State = EntityState.Modified;
            }
            await Db.SaveChangesAsync();
        }

        public async Task BulkUpdateAsync(IList<T> entities)
        {
            Db.Set<T>().UpdateRange(entities);
            await Db.SaveChangesAsync();
        }

        public async Task BulkDeleteAsync(IList<T> entities)
        {
            Db.Set<T>().RemoveRange(entities);
            await Db.SaveChangesAsync();
        }

        public async Task<IList<T>> BulkSearchAsync(IList<T> items, string fieldName)
        {
            // Tìm theo danh sách giá trị của fieldName (reflection)
            if (items == null || items.Count == 0 || string.IsNullOrWhiteSpace(fieldName))
                return new List<T>();

            var prop = typeof(T).GetProperty(fieldName);
            if (prop == null) throw new ArgumentException($"Field '{fieldName}' không tồn tại trong {typeof(T).Name}");

            var values = items.Select(x => prop.GetValue(x)).Where(v => v != null).Distinct().ToList();
            if (values.Count == 0) return new List<T>();

            // x => values.Contains(EF.Property<object>(x, fieldName))
            var param = Expression.Parameter(typeof(T), "x");
            var property = Expression.Call(typeof(EF), nameof(EF.Property), new[] { typeof(object) }, param, Expression.Constant(fieldName));
            var contains = Expression.Call(Expression.Constant(values), typeof(List<object>).GetMethod("Contains")!, property);
            var lambda = Expression.Lambda<Func<T, bool>>(contains, param);

            return await Db.Set<T>().AsNoTracking().Where(lambda).ToListAsync();
        }

        public Task EnsureCollectionLoadedAsync<TProperty>(T entity, Expression<Func<T, IEnumerable<TProperty>>> propertyExpression, CancellationToken cancellationToken = default) where TProperty : class
            => Db.Entry(entity).Collection(propertyExpression).LoadAsync(cancellationToken);

        public Task EnsurePropertyLoadedAsync<TProperty>(T entity, Expression<Func<T, TProperty>> propertyExpression, CancellationToken cancellationToken = default) where TProperty : class
            => Db.Entry(entity).Reference(propertyExpression).LoadAsync(cancellationToken);

        public T GetById(params object[] keyValues)
            => Db.Set<T>().Find(keyValues)!;

        public T Insert(T entity)
        {
            Db.Set<T>().Add(entity);
            Db.SaveChanges();
            return entity;
        }

        public void Update(T entity)
        {
            Db.Set<T>().Update(entity);
            Db.SaveChanges();
        }

        public void Delete(T entity)
        {
            Db.Set<T>().Remove(entity);
            Db.SaveChanges();
        }

        public IQueryable<T> SearchQuery(Expression<Func<T, bool>> domain = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, int offSet = 0, int limit = 0, bool isPagingEnabled = false)
        {
            // Sử dụng AsNoTracking() cho read-only queries để tăng performance
            IQueryable<T> query = Db.Set<T>().AsNoTracking();

            if (domain != null)
                query = query.Where(domain);

            if (orderBy != null)
                query = orderBy(query);

            if (isPagingEnabled && limit > 0)
                query = query.Skip(offSet).Take(limit);

            return query;
        }

        public IEnumerable<T> SqlQuery(string sql, params object[] parameters)
            => Db.Set<T>().FromSqlRaw(sql, parameters).AsNoTracking().AsEnumerable();

        public EntityEntry<T> GetEntry(T entity)
            => Db.Entry(entity);

        public IQueryable<T> SearchQuery(ISpecification<T> spec, Func<IQueryable<T>, IOrderedQueryable<T>> sort = null, string includes = "", int offset = 0, int limit = 0, bool isPagingEnabled = false)
        {
            // Sử dụng AsNoTracking() cho read-only queries để tăng performance
            var query = ApplySpecification(spec).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(includes))
            {
                foreach (var inc in includes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    query = query.Include(inc);
            }

            if (sort != null)
                query = sort(query);

            if (isPagingEnabled && limit > 0)
                query = query.Skip(offset).Take(limit);

            return query;
        }

        public Task<List<T>> SearchAsync(Expression<Func<T, bool>> domain = null, int offSet = 0, int limit = int.MaxValue)
        {
            IQueryable<T> query = Db.Set<T>().AsNoTracking();

            if (domain != null)
                query = query.Where(domain);

            if (limit > 0 && offSet >= 0)
                query = query.Skip(offSet).Take(limit);

            return query.ToListAsync();
        }

        private IQueryable<T> ApplySpecification(ISpecification<T> spec)
        {
            IQueryable<T> query = Db.Set<T>();

            if (spec == null) return query;

            // ISpecification phổ biến: Criteria, Includes, IncludeStrings, OrderBy, OrderByDescending, Skip, Take, IsPagingEnabled
            if (spec.Criteria != null)
                query = query.Where(spec.Criteria);

            if (spec.Includes != null)
            {
                foreach (var include in spec.Includes)
                    query = query.Include(include);
            }

            if (spec.IncludeStrings != null)
            {
                foreach (var include in spec.IncludeStrings)
                    query = query.Include(include);
            }

            if (spec.OrderBy != null)
                query = query.OrderBy(spec.OrderBy);
            else if (spec.OrderByDescending != null)
                query = query.OrderByDescending(spec.OrderByDescending);

            if (spec.IsPagingEnabled)
            {
                if (spec.Skip > 0) query = query.Skip(spec.Skip);
                if (spec.Take > 0) query = query.Take(spec.Take);
            }

            return query;
        }
    }
}
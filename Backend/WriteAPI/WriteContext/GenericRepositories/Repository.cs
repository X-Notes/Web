using Common.DatabaseModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.GenericRepositories
{
    public class Repository<T, IdType> : IRepository<T, IdType> where T : BaseEntity<IdType> where IdType : struct
    {
        public readonly WriteContextDB context;
        protected DbSet<T> entities;
        public Repository(WriteContextDB context)
        {
            this.context = context;
            entities = context.Set<T>();
        }

        public async Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
            => await entities.FirstOrDefaultAsync(predicate);

        public async Task<EntityEntry<T>> AddAsync(T entity)
        {
            var ent = await entities.AddAsync(entity);
            await context.SaveChangesAsync();
            return ent;
        }

        public async Task UpdateAsync(T entity)
        {
            entities.Update(entity);
            await context.SaveChangesAsync();
        }

        public async Task RemoveAsync(T entity)
        {
            entities.Remove(entity);
            await context.SaveChangesAsync();
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await entities.ToListAsync();
        }

        public async Task<List<T>> GetWhereAsync(Expression<Func<T, bool>> predicate)
        {
            return await entities.Where(predicate).ToListAsync();
        }

        public async Task<int> GetCountAsync(Expression<Func<T, bool>> predicate)
        {
            return await entities.Where(predicate).CountAsync();
        }

        public async Task UpdateRangeAsync(IEnumerable<T> ents)
        {
            this.entities.UpdateRange(ents);
            await context.SaveChangesAsync();
        }

        public async Task RemoveRangeAsync(IEnumerable<T> ents)
        {
            this.entities.RemoveRange(ents);
            await context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<T> ents)
        {
            await entities.AddRangeAsync(ents);
            await context.SaveChangesAsync();
        }
    }
}

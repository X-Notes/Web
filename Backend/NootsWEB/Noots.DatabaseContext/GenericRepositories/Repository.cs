using System.Linq.Expressions;
using Common.DatabaseModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Noots.DatabaseContext.GenericRepositories
{
    public class Repository<T, IdType> : IRepository<T, IdType> where T : BaseEntity<IdType> where IdType : struct
    {
        public readonly NootsDBContext context;
        protected DbSet<T> entities;
        public Repository(NootsDBContext context)
        {
            this.context = context;
            entities = context.Set<T>();
        }

        public Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate) => entities.FirstOrDefaultAsync(predicate);

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

        public Task<List<T>> GetAllAsync()
        {
            return entities.ToListAsync();
        }

        public Task<List<T>> GetWhereAsync(Expression<Func<T, bool>> predicate)
        {
            return entities.Where(predicate).ToListAsync();
        }

        public Task<int> GetCountAsync(Expression<Func<T, bool>> predicate)
        {
            return entities.Where(predicate).CountAsync();
        }

        public Task<bool> GetAnyAsync(Expression<Func<T, bool>> predicate)
        {
            return entities.AnyAsync(predicate);
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

        public async Task AddRangeAsync(List<T> ents)
        {
            await entities.AddRangeAsync(ents);
            await context.SaveChangesAsync();
        }
    }
}

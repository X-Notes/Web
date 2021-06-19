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

        public async Task<T> GetById(IdType id) => await entities.FirstOrDefaultAsync(z => EqualityComparer<IdType>.Default.Equals(z.Id, id));
        public async Task<T> GetByIdNoCache(IdType id) => await entities.AsNoTracking().FirstOrDefaultAsync(z => EqualityComparer<IdType>.Default.Equals(z.Id, id));
        public async Task<T> FirstOrDefault(Expression<Func<T, bool>> predicate)
            => await entities.FirstOrDefaultAsync(predicate);

        public async Task<EntityEntry<T>> Add(T entity)
        {
            var ent = await entities.AddAsync(entity);
            await context.SaveChangesAsync();
            return ent;
        }

        public async Task Update(T entity)
        {
            entities.Update(entity);
            await context.SaveChangesAsync();
        }

        public async Task Remove(T entity)
        {
            entities.Remove(entity);
            await context.SaveChangesAsync();
        }

        public async Task RemoveById(IdType id)
        {
            var ent = await GetById(id);
            entities.Remove(ent);
            await context.SaveChangesAsync();
        }


        public async Task<List<T>> GetAll()
        {
            return await entities.ToListAsync();
        }

        public async Task<List<T>> GetWhere(Expression<Func<T, bool>> predicate)
        {
            return await entities.Where(predicate).ToListAsync();
        }

        public async Task UpdateRange(IEnumerable<T> ents)
        {
            this.entities.UpdateRange(ents);
            await context.SaveChangesAsync();
        }

        public async Task RemoveRange(IEnumerable<T> ents)
        {
            this.entities.RemoveRange(ents);
            await context.SaveChangesAsync();
        }

        public async Task AddRange(IEnumerable<T> ents)
        {
            await entities.AddRangeAsync(ents);
            await context.SaveChangesAsync();
        }
    }
}

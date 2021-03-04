using Common.DatabaseModels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.GenericRepositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly WriteContextDB context;
        protected DbSet<T> entities;
        public Repository(WriteContextDB context)
        {
            this.context = context;
            entities = context.Set<T>();
        }

        public async Task<T> GetById(Guid id) => await entities.FirstOrDefaultAsync(z => z.Id == id);

        public async Task<T> FirstOrDefault(Expression<Func<T, bool>> predicate)
            => await entities.FirstOrDefaultAsync(predicate);

        public async Task Add(T entity)
        {
            await entities.AddAsync(entity);
            await context.SaveChangesAsync();
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

        public async Task<List<T>> GetAll()
        {
            return await entities.ToListAsync();
        }

        public async Task<List<T>> GetWhere(Expression<Func<T, bool>> predicate)
        {
            return await entities.Where(predicate).ToListAsync();
        }

        public async Task UpdateRange(List<T> ents)
        {
            this.entities.UpdateRange(ents);
            await context.SaveChangesAsync();
        }

        public async Task RemoveRange(List<T> ents)
        {
            this.entities.RemoveRange(ents);
            await context.SaveChangesAsync();
        }

        public async Task AddRange(List<T> ents)
        {
            await entities.AddRangeAsync(ents);
            await context.SaveChangesAsync();
        }
    }
}

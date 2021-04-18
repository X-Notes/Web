using Common.DatabaseModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.GenericRepositories
{
    public interface IRepository<T> where T : BaseEntity
    {
        Task<T> GetById(Guid id);
        Task<T> FirstOrDefault(Expression<Func<T, bool>> predicate);

        Task Add(T entity);
        Task AddRange(IEnumerable<T> ents);

        Task Update(T entity);
        Task UpdateRange(IEnumerable<T> entities);

        Task Remove(T entity);
        Task RemoveRange(IEnumerable<T> entities);

        Task<List<T>> GetAll();
        Task<List<T>> GetWhere(Expression<Func<T, bool>> predicate);
    }
}

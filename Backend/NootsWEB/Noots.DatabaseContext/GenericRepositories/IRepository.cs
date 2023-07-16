using System.Linq.Expressions;
using Common.DatabaseModels;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Noots.DatabaseContext.GenericRepositories;

public interface IRepository<T, IdType> where T : BaseEntity<IdType>
{
    Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task<V> GetMinAsync<V>(Expression<Func<T, V>> predicate);
    Task<V> GetMaxAsync<V>(Expression<Func<T, V>> predicate);

    Task<EntityEntry<T>> AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> ents);

    Task UpdateAsync(T entity);
    Task UpdateRangeAsync(IEnumerable<T> entities);

    Task RemoveAsync(T entity);
    Task RemoveRangeAsync(IEnumerable<T> entities);

    Task<List<T>> GetAllAsync();
    Task<List<T>> GetAllNoTrackAsync();
    Task<List<T>> GetWhereAsync(Expression<Func<T, bool>> predicate);
    Task<List<T>> GetWhereAsNoTrackingAsync(Expression<Func<T, bool>> predicate);
}

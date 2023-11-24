using Common.DatabaseModels;

namespace DatabaseContext.Dapper;

public interface IDapperRepository<T, IdType> where T : BaseEntity<IdType>
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> GetByIdAsync(int id);
    Task<bool> DeleteAsync(int id);
    Task<bool> DeleteAsync(IEnumerable<IdType> ids);
}

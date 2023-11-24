using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Models;
using DatabaseContext.GenericRepositories;
using Microsoft.Extensions.DependencyInjection;

namespace DatabaseContext.Repositories.Files
{
    public class StorageRepository
    {
        private readonly IServiceScopeFactory scopeFactory;

        private Dictionary<StoragesEnum, Storage> _cache = null;

        public StorageRepository(IServiceScopeFactory scopeFactory)
        {
            this.scopeFactory = scopeFactory;
        }

        private async Task InitAsync()
        {
            if (_cache == null)
            {
                using var scope = scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<NootsDBContext>();
                var repo = new Repository<Storage, StoragesEnum>(context);

                var ents = await repo.GetAllAsync();
                _cache = ents.ToDictionary(x => x.Id);
            }
        }

        public async Task<List<Storage>> GetAllCacheAsync()
        {
            await InitAsync();
            return _cache.Values.ToList();
        }

        public async Task<Storage> FirstOrDefaultCacheAsync(StoragesEnum id)
        {
            await InitAsync();
            return _cache[id];
        }
    }
}

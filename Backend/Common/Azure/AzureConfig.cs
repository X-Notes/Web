using Common.DatabaseModels.Models.Files.Models;
using System.Collections.Generic;
using System.Linq;

namespace Common.Azure
{
    public class AzureConfig
    {
        private Dictionary<StoragesEnum, AzureStorage> _cache = null;

        public List<AzureStorage> Storages { set; get; }

        private void InitAsync()
        {
            if (_cache == null)
            {
                _cache = Storages.ToDictionary(x => x.Id);
            }
        }

        public List<AzureStorage> GetAll()
        {
            InitAsync();
            return _cache.Values.ToList();
        }

        public AzureStorage FirstOrDefaultCache(StoragesEnum id)
        {
            InitAsync();
            return _cache[id];
        }
    }

    public class AzureStorage
    {
        public string Name { set; get; }

        public StoragesEnum Id { set; get; }

        public string Url { set; get; }

        public string Connection { set; get; }
    }
}

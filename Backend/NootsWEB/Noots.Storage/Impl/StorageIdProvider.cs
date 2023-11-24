using Common.Azure;
using Common.DatabaseModels.Models.Files.Models;

namespace Storage.Impl
{
    public class StorageIdProvider
    {
        private static readonly Random Random = new();
        
        private readonly AzureConfig azureConfig;

        public StorageIdProvider(AzureConfig azureConfig)
        {
            this.azureConfig = azureConfig;
        }

        public StoragesEnum GetStorageId()
        {
            var ids = azureConfig.GetAll().Select(x => x.Id).ToList();
            int randomIndex = Random.Next(ids.Count);
            return ids[randomIndex];
        }
    }
}

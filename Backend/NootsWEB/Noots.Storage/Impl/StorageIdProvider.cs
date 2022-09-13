using Common.DatabaseModels.Models.Files.Models;
using Microsoft.AspNetCore.Hosting;

namespace Noots.Storage.Impl
{
    public class StorageIdProvider
    {
        private readonly IHostingEnvironment hostEvn;

        public StorageIdProvider(IHostingEnvironment hostEvn)
        {
            this.hostEvn = hostEvn;
        }

        public StoragesEnum GetStorageId()
        {
            if (hostEvn.IsDevelopment())
            {
                return StoragesEnum.DEV;
            }

            throw new Exception("NO IMPLEMENTED");
        }
    }
}

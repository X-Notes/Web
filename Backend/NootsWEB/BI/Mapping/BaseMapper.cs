using Common.Azure;
using System;


namespace BI.Mapping
{
    public abstract class BaseMapper
    {

        private readonly AzureConfig azureConfig;

        public BaseMapper(AzureConfig azureConfig)
        {
            this.azureConfig = azureConfig; 
        }

        public string BuildFilePath(Guid userId, string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return null;
            }
            return this.azureConfig.StorageEmulatorUrl + "/" + userId + "/" + path;
        }
    }
}

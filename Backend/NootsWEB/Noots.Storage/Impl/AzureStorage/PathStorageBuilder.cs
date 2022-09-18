
using Noots.Storage.Entities;

namespace Noots.Storage.Impl.AzureStorage
{
    public class PathStorageBuilder
    {
        private Dictionary<ContentTypesFile, string> contentFolders = new Dictionary<ContentTypesFile, string>()
        {
            {  ContentTypesFile.Photos, "Images" },
            {  ContentTypesFile.Videos, "Videos" },
            {  ContentTypesFile.Documents,  "Files"  },
            {  ContentTypesFile.Audios, "Audios" },
        };

        public string GetPrefixContentFolder(ContentTypesFile type)
        {
            if (!contentFolders.ContainsKey(type))
            {
                throw new ArgumentException("Type does not exist");
            }
            return contentFolders[type];
        }

        public string GetContentPathFileId()
        {
            return Guid.NewGuid() + "-" + Guid.NewGuid();
        }
    }
}

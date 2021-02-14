using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public class FilesStorage : IFilesStorage
    {
        private string root = "UserFiles";
        private List<string> folders;
        DirectoryInfo rootFilesDirectory = new DirectoryInfo(Environment.CurrentDirectory).Parent;
        public FilesStorage()
        {
            folders = new List<string>()
            {
                "Images",
                "Audios",
                "Videos",
                "Files",
            };
        }

        public void CreateIfMissing()
        {
            var directory = rootFilesDirectory.FullName + root;
            bool folderExists = Directory.Exists(directory);
            if (!folderExists)
                Directory.CreateDirectory(directory);
        }


        public void CreateUserFolders(Guid userId)
        {
            foreach (var folder in folders)
            {
                var path = root + userId + folder;
                DirectoryInfo di = Directory.CreateDirectory(path);
            }
        }

        public void Dispose()
        {
            
        }
    }
}

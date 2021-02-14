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
        private string root = new DirectoryInfo(Environment.CurrentDirectory).Parent.Parent + "\\" + "UserFiles";
        private List<string> folders;
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
            bool folderExists = Directory.Exists(root);
            if (!folderExists)
                Directory.CreateDirectory(root);
        }


        public void CreateUserFolders(Guid userId)
        {
            var userDirectory = root + "\\" + userId;
            Directory.CreateDirectory(userDirectory);

            foreach (var folderName in folders)
            {
                var path = userDirectory + "\\" + folderName;
                Directory.CreateDirectory(path);
            }
        }

        public void Dispose()
        {
            
        }
    }
}

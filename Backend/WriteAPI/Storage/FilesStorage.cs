using Microsoft.AspNetCore.Http;
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
        private string root = new DirectoryInfo(Environment.CurrentDirectory).Parent.Parent + "\\" + "AppFiles";
        private string userRoot = "\\Users";
        private string notesRoot = "\\Notes";

        private Dictionary<ContentTypes, string> folders;
        public FilesStorage()
        {
            folders = new Dictionary<ContentTypes, string>()
            {
                {  ContentTypes.Images, "Images" },
                {  ContentTypes.Videos, "Videos" },
                {  ContentTypes.Files,  "Files"  },
                {  ContentTypes.Audios, "Audios" },
            };
        }

        public string GetValueFromDictionary(ContentTypes type)
        {
            return folders.GetValueOrDefault(type);
        }

        public void CreateIfMissing()
        {
            bool folderExists = Directory.Exists(root);
            if (!folderExists)
            {
                Directory.CreateDirectory(root);
                Directory.CreateDirectory(root + userRoot);
                Directory.CreateDirectory(root + notesRoot);
            }
        }


        public void CreateUserFolders(Guid userId)
        {
            var userDirectory = root + userRoot + "\\" + userId;
            Directory.CreateDirectory(userDirectory);

            foreach (var folderName in folders)
            {
                var path = userDirectory + "\\" + folderName.Value;
                Directory.CreateDirectory(path);
            }
        }

        public void CreateNoteFolders(Guid noteId)
        {
            var noteDirectory = root + notesRoot + "\\" + noteId;
            Directory.CreateDirectory(noteDirectory);

            foreach (var folderName in folders)
            {
                var path = noteDirectory + "\\" + folderName.Value;
                Directory.CreateDirectory(path);
            }
        }

        public async Task<string> SaveUserFile(IFormFile file, Guid userId, string contentFolder, string fileTypeEnd)
        {
            var userFolder = GetUserFolder(userId, contentFolder);
            var path = userFolder + "\\" + Guid.NewGuid() + fileTypeEnd;
            using var stream = File.Create(path);
            await file.CopyToAsync(stream);
            return path;
        }

        public void RemoveFile(string path)
        {
            if (File.Exists(path))
            {
                File.Delete(path);
                Console.WriteLine("File Deleted");
            }
            else
            {
                Console.WriteLine("File not Founded");
            }
        }

        public void GetContentTypeForResponce(string path)
        {
            var types = path.Split(".");
            var type = types[types.Length - 1];
            Console.WriteLine(type);
        }

        public string GetUserFolder(Guid userId, string contentFolder)
        {
            return root + "\\" + userRoot + "\\" + userId + "\\" + contentFolder;
        }

        public void Dispose()
        {

        }
    }
}

using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public interface IFilesStorage : IDisposable
    {
        public void CreateUserFolders(Guid userId);
        public void CreateNoteFolders(Guid noteId);
        public void CreateIfMissing();
        Task<string> SaveUserFile(IFormFile file, Guid userId, string contentFolder, string fileTypeEnd);
        string GetValueFromDictionary(ContentTypes type);
        void RemoveFile(string path);
    }
}

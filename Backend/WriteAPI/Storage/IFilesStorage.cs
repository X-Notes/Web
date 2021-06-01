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
        Task<string> SaveUserFile(IFormFile file, Guid userId, ContentTypesFile contentFolder, string fileTypeEnd);
        Task<string> SaveNoteFiles(IFormFile file, Guid noteId, ContentTypesFile contentFolder, string fileTypeEnd);
        Task<string> SaveNoteFiles(byte[] file, string ContentType, Guid noteId, ContentTypesFile contentFolder, string fileTypeEnd);
        Task RemoveUserFile(string path);
        Task RemoveNoteFile(string path);
    }
}

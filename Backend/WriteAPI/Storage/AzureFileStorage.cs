using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public class AzureFileStorage : IFilesStorage
    {
        private readonly BlobServiceClient blobServiceClient;

        private string userRoot = "users";
        private string notesRoot = "notes";

        private readonly BlobContainerClient _blobContainerClientUser;
        private readonly BlobContainerClient _blobContainerClientNotes;
        private Dictionary<ContentTypesFile, string> folders;

        public AzureFileStorage(BlobServiceClient blobServiceClient)
        {
            this.blobServiceClient = blobServiceClient;
            _blobContainerClientUser = blobServiceClient.GetBlobContainerClient(userRoot);
            _blobContainerClientNotes = blobServiceClient.GetBlobContainerClient(notesRoot);

            folders = new Dictionary<ContentTypesFile, string>()
            {
                {  ContentTypesFile.Images, "Images" },
                {  ContentTypesFile.Videos, "Videos" },
                {  ContentTypesFile.Files,  "Files"  },
                {  ContentTypesFile.Audios, "Audios" },
            };
        }

        public void CreateIfMissing()
        {
            _blobContainerClientUser.CreateIfNotExists();
            _blobContainerClientNotes.CreateIfNotExists();
        }

        public void CreateNoteFolders(Guid noteId)
        {

        }

        public void CreateUserFolders(Guid userId)
        {

        }

        public void Dispose()
        {

        }

        private string GetValueFromDictionary(ContentTypesFile type)
        {
            return folders.GetValueOrDefault(type);
        }

        public async Task RemoveUserFile(string path)
        {
           await _blobContainerClientUser.DeleteBlobAsync(path);
        }

        public async Task RemoveNoteFile(string path)
        {
            await _blobContainerClientNotes.DeleteBlobAsync(path);
        }

        private async Task<MemoryStream> GetStreamFromFormFile(IFormFile file)
        {
            var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;
            return ms;
        }
        private MemoryStream GetStreamFromBytes(byte[] bytes)
        {
            var ms = new MemoryStream(bytes);
            ms.Position = 0;
            return ms;
        }


        private BlobHttpHeaders GetBlobHttpHeaders(IFormFile file)
        {
            var headers = new BlobHttpHeaders();
            headers.ContentType = file.ContentType;
            return headers;
        }

        private BlobHttpHeaders GetBlobHttpHeaders(string contentType)
        {
            var headers = new BlobHttpHeaders();
            headers.ContentType = contentType;
            return headers;
        }

        public async Task<string> SaveNoteFiles(IFormFile file, Guid noteId, ContentTypesFile contentFolder, string fileTypeEnd)
        {
            var path = GetNoteFolder(noteId, contentFolder) + "\\" + Guid.NewGuid() + fileTypeEnd;
            var blobClient = _blobContainerClientNotes.GetBlobClient(path);

            var stream = await GetStreamFromFormFile(file);
            var headers = GetBlobHttpHeaders(file);

            var resp = await blobClient.UploadAsync(stream, headers);

            await stream.DisposeAsync();
            return blobClient.Name;
        }

        public async Task<string> SaveNoteFiles(byte[] file, string contentType, Guid noteId, ContentTypesFile contentFolder, string fileTypeEnd)
        {
            var path = GetNoteFolder(noteId, contentFolder) + "\\" + Guid.NewGuid() + fileTypeEnd;
            var blobClient = _blobContainerClientNotes.GetBlobClient(path);

            var stream = GetStreamFromBytes(file);
            var headers = GetBlobHttpHeaders(contentType);

            var resp = await blobClient.UploadAsync(stream, headers);

            await stream.DisposeAsync();
            return blobClient.Name;
        }

        public async Task<string> SaveUserFile(IFormFile file, Guid userId, ContentTypesFile contentFolder, string fileTypeEnd)
        {
            var path = GetUserFolder(userId, contentFolder) + "\\" + Guid.NewGuid() + fileTypeEnd;
            var blobClient = _blobContainerClientUser.GetBlobClient(path);

            var stream =  await GetStreamFromFormFile(file);
            var headers = GetBlobHttpHeaders(file);

            var resp = await blobClient.UploadAsync(stream, headers);

            await stream.DisposeAsync();
            return blobClient.Name;
        }

        public string GetUserFolder(Guid userId, ContentTypesFile contentFolder)
        {
            return userId + "\\" + GetValueFromDictionary(contentFolder);
        }

        public string GetNoteFolder(Guid noteId, ContentTypesFile contentFolder)
        {
            return noteId + "\\" + GetValueFromDictionary(contentFolder);
        }
    }
}

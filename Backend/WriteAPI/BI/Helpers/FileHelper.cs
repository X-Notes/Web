using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Files;
using Microsoft.AspNetCore.Http;

namespace BI.Helpers
{
    public static class FileHelper
    {
        private static async Task<byte[]> GetBytesFromFile(IFormFile file)
        {
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }

        private static string ConvertBase64png(byte[] bytes)
        {
            var base64 = Convert.ToBase64String(bytes);
            return "data:image/png;base64," + base64;
        }
        private static string ConvertBase64jpeg(byte[] bytes)
        {
            var base64 = Convert.ToBase64String(bytes);
            return "data:image/jpeg;base64," + base64;
        }

        public static async Task<string> GetBase64(IFormFile file)
        {
            var bytes = await GetBytesFromFile(file);
            var base64 = "";
            if (file.ContentType.ToString() == "image/png")
            {
                base64 = ConvertBase64png(bytes);
            }
            if (file.ContentType.ToString() == "image/jpeg")
            {
                base64 = ConvertBase64jpeg(bytes);
            }
            return base64;
        }

        public static string GetExtension(string filename)
        {
            return Path.GetExtension(filename);        
        }

        public static async Task<FilesBytes> GetFilesBytesAsync(this IFormFile formFile)
        {
            using var ms = new MemoryStream();
            await formFile.CopyToAsync(ms);
            var bytes = ms.ToArray();
            return new FilesBytes(bytes, formFile.ContentType, formFile.FileName);
        }

        public static async Task<List<FilesBytes>> GetFilesBytesAsync(this List<IFormFile> formFiles)
        {
            var tasks = formFiles.Select(x => GetFilesBytesAsync(x));
            var result = await Task.WhenAll(tasks);
            return result.ToList();
        }

    }
}

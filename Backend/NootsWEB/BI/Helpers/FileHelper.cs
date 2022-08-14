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

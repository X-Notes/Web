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
        public static string GetExtensionByMIME(string mime) => mime switch
        {
            "image/png" =>  ".png",
            "image/jpeg" => ".jpeg",
            "video/mp4" =>  ".mp4",
            "audio/mpeg" => ".mp3",
            "audio/wav" => ".wav",
            "audio/ogg" => ".ogg",
            "application/pdf" => ".pdf",
            "application/msword" => ".doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => ".docx",
            "application/rtf" => ".rtf",
            "text/plain" => ".txt",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => ".xlsx",
            "application/vnd.ms-excel" => ".xls",
            "application/vnd.ms-excel.sheet.macroEnabled.12" => ".xlsm",
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12" => ".xlsb",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" => ".pptx",
            "application/vnd.ms-powerpoint" => ".ppt",
            "application/vnd.ms-powerpoint.presentation.macroEnabled.12" => ".pptm",
            "application/vnd.ms-powerpoint.slideshow.macroEnabled.12" => ".ppsm",
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow" => ".ppsx",
            _ => throw new ArgumentOutOfRangeException(nameof(mime), $"Not expected direction value: {mime}"),
        };

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

using Common.DTO.files;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BI.helpers
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

        public static string GetPhotoType(string contentType)
        {
            switch (contentType)
            {
                case "image/png":
                    {
                        return ".png";
                    }
                case "image/jpeg":
                    {
                        return ".jpg";
                    }
                default:
                    {
                        throw new Exception("Incorrect photo type");
                    }
            }
        }

        public static string GetAudioType(string contentType)
        {
            switch (contentType)
            {
                case "audio/mpeg":
                    {
                        return ".mp3";
                    }
                default:
                    {
                        throw new Exception("Incorrect audio type");
                    }
            }
        }


        public static string GetVideoType(string contentType)
        {
            switch (contentType)
            {
                case "video/mp4":
                    {
                        return ".mp4";
                    }
                default:
                    {
                        throw new Exception("Incorrect audio type");
                    }
            }
        }

        public static string GetDocumentType(string contentType)
        {
            switch (contentType)
            {
                case "application/pdf":
                    {
                        return ".pdf";
                    }
                case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                    {
                        return ".pptx";
                    }
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    {
                        return ".docx";
                    }
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    {
                        return ".xlsx";
                    }
                default:
                    {
                        throw new Exception("Incorrect document type");
                    }
            }
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

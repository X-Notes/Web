using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace BI.helpers
{
    public class PhotoHelpers
    {
        private async Task<byte[]> GetBytesFromFile(IFormFile file)
        {
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }
        private string ConvertBase64png(byte[] bytes)
        {
            var base64 = Convert.ToBase64String(bytes);
            return "data:image/png;base64," + base64;
        }
        private string ConvertBase64jpeg(byte[] bytes)
        {
            var base64 = Convert.ToBase64String(bytes);
            return "data:image/jpeg;base64," + base64;
        }

        public async Task<string> GetBase64(IFormFile file)
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

        public string GetPhotoType(IFormFile file)
        {
            switch (file.ContentType.ToString())
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
    }
}

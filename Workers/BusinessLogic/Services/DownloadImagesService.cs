using BusinessLogic.Interfaces;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class DownloadImagesService: IDownloadImagesService
    {
        private readonly HttpClient _client;

        public DownloadImagesService(HttpClient _client)
        {
            this._client = _client;
        }
        public async Task<string> GetImage(string url)
        {
            HttpResponseMessage response = await _client.GetAsync(url);
  
            byte[] content = await response.Content.ReadAsByteArrayAsync();
            Console.WriteLine("Image");
            string image = null;
            if (url.Contains(".jpeg"))
            {
                image = "data:image/jpeg;base64," + Convert.ToBase64String(content);
            }
            else
            {
                image = "data:image/png;base64," + Convert.ToBase64String(content);
            }
            return image;
        }
    }
}

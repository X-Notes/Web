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
            Console.WriteLine(1);
            byte[] content = await response.Content.ReadAsByteArrayAsync();
            var image = "data:image/png;base64," + Convert.ToBase64String(content);
            return image;
        }
    }
}

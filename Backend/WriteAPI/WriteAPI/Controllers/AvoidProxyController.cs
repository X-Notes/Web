using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AvoidProxyController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        public AvoidProxyController(IHttpClientFactory _clientFactory)
        {
            this._clientFactory = _clientFactory;
        }

        [HttpPost]
        public async Task<ResponseUrlFetch> Get(FetchUrlModel model)
        {
            var client = _clientFactory.CreateClient();
            var content = await (await client.GetAsync(model.Url)).Content.ReadAsStringAsync();
            return new ResponseUrlFetch(content);
        }
    }
    public class FetchUrlModel
    {
        public string Url { set; get; }
    }
    public class ResponseUrlFetch
    {
        public string Content { set; get; }
        public ResponseUrlFetch(string Content)
        {
            this.Content = Content;
        }
    }
}

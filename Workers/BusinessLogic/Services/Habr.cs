using AngleSharp;
using AngleSharp.Html.Dom;
using BusinessLogic.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class Habr : IHabr
    {
        public Habr()
        {
            
        }
        public async Task<List<List<string>>> ParsePages(int pages)
        {
            var tasks = new List<Task<IEnumerable<string>>>();

            var baseAddress = "https://habr.com/ru/all/page";

            var articles = new List<List<string>>();

            for(int i = 0; i < pages; i++)
            {
                var t = GetLinksFromPage(baseAddress + (i + 1).ToString() + '/');
                tasks.Add(t);
            }
            await Task.WhenAll(tasks);

            foreach(var result in tasks)
            {
                articles.Add(result.Result.ToList());
            }
            return articles;
        }
        public async Task<IEnumerable<string>> GetLinksFromPage(string adress)
        {
            var config = Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);
            IEnumerable<string> links = null;
            try
            {
                var document = await context.OpenAsync(adress);
                var articles = document.GetElementsByClassName("post__title_link");
                links = articles.Cast<IHtmlAnchorElement>().Select(x => x.Href);
                Console.WriteLine(links);
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            return links;
        }
    }
}

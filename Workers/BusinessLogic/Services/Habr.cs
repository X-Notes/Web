using AngleSharp;
using BusinessLogic.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class Habr : IHabr
    {

        public async Task<string> GetSite()
        {
            var config = Configuration.Default.WithDefaultLoader();
            var address = "https://habr.com/ru/post/273807/";
            var context = BrowsingContext.New(config);
            try
            {
                var document = await context.OpenAsync(address);
                var cellSelector = "h3";
                var cells = document.QuerySelectorAll(cellSelector);
                var titles = cells.Select(m => m.TextContent);
                Console.WriteLine(document+ "ssd");
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            return "ssd";
        }
    }
}

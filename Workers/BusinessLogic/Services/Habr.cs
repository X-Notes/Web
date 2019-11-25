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
    public class Habr : IHabr // Защита от бесконечного цикла
    {
        string  baseAddress = "https://habr.com/ru/all/page";

        private readonly IDownloadImagesService downloadImages;
        public Habr(IDownloadImagesService downloadImages)
        {
            this.downloadImages = downloadImages;
        }



        public async Task ParseConcretePages(List<List<string>> ListPages)
        {
            var config = Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);

            foreach(var page in ListPages)
            {
                foreach (var link in page)
                {
                    var document = await context.OpenAsync(link);
                   
                    var body = document.GetElementById("post-content-body").TextContent;

                    var Images = document.GetElementById("post-content-body").GetElementsByTagName("img").Cast<IHtmlImageElement>();
                    var TasksImages = Images.Select(x => downloadImages.GetImage(x.Source)); 
                    await Task.WhenAll(TasksImages);
                    var images = TasksImages.Select(x => x.Result);

                    var title = document.GetElementsByClassName("post__title-text").FirstOrDefault().InnerHtml;
                    var tags = document.GetElementsByClassName("inline-list__item-link post__tag").Select(x=> x.InnerHtml).ToList();
                    var time = document.GetElementsByClassName("post__time").FirstOrDefault().OuterHtml.Split('\"').Skip(3).FirstOrDefault().Trim('"');
                    var user = document.GetElementsByClassName("user-info__nickname user-info__nickname_small").FirstOrDefault().InnerHtml;

                    //Console.WriteLine(time);
                    //Console.WriteLine(body);
                    //Console.WriteLine(tags);
                }
            }
        }

        public async Task<List<List<string>>> ParseMainPages(int pages)
        {
            var tasks = new List<Task<IEnumerable<string>>>();


            var articles = new List<List<string>>();

            for(int i = 0; i < pages; i++)
            {
                var t = GetLinksFromMainPage(baseAddress + (i + 1).ToString() + '/');
                tasks.Add(t);
            }

            await Task.WhenAll(tasks);

            foreach(var result in tasks)
            {
                articles.Add(result.Result.ToList());
            }
            return articles;
        }
        public async Task<IEnumerable<string>> GetLinksFromMainPage(string adress)
        {
            var config = Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);

            IEnumerable<string> links = null;
            try
            {

                var document = await context.OpenAsync(adress);

                if(document.Title == "HTTP 503")
                {
                    while(document.Title == "HTTP 503")
                    {
                        Thread.Sleep(200);
                        document = await context.OpenAsync(adress);
                    }
                }

                var articles = document.GetElementsByClassName("post__title_link");


                if (articles.Count() < 19)
                {
                    while (articles.Count() < 19)
                    {
                        Thread.Sleep(100);
                        document = await context.OpenAsync(adress);
                        articles =  document.GetElementsByClassName("post__title_link");
                    
                    }
                }
                 links = articles.Cast<IHtmlAnchorElement>().Select(x => x.Href);
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            return links;
        }
    }
}

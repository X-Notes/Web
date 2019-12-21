using AngleSharp;
using AngleSharp.Dom;
using AngleSharp.Html.Dom;
using AngleSharp.Html.Parser;
using BusinessLogic.Interfaces;
using DataAccess.Interfaces;
using DataAccess.IRepositories;
using Shared.Elastic;
using Shared.Mongo;
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

        private readonly INootRepository nootRepository = null;
        private readonly IElasticSearch elasticSearch = null;

        public Habr(IDownloadImagesService downloadImages, INootRepository nootRepository, IElasticSearch elasticSearch)
        {
            this.downloadImages = downloadImages;
            this.nootRepository = nootRepository;
            this.elasticSearch = elasticSearch;
        }



        public async Task ParseConcretePage(string adress)
        {
            var config = Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);


            var document = await context.OpenAsync(adress);


            if (document.Title == "HTTP 503")
            {
                while (document.Title == "HTTP 503")
                {
                    Thread.Sleep(100);
                    document = await context.OpenAsync(adress);
                }
            }

            var mongoNoot  = CreateMongoDocument(document);
            mongoNoot = await nootRepository.Add(mongoNoot);

            var elasticNoot = await CreateElasticDocument(document, mongoNoot);
            await elasticSearch.CreateAsync(elasticNoot);
        }
        public async Task<ElasticNoot> CreateElasticDocument(IDocument document, MongoNoot noot)
        {
            var s = document.GetElementById("post-content-body");
            var body = document.GetElementById("post-content-body").TextContent;
            var Images = document.GetElementById("post-content-body").GetElementsByTagName("img").Cast<IHtmlImageElement>();

            var images = Images.Select(x => x.Source).ToList();

            //var TasksImages = Images.Select(x => downloadImages.GetImage(x.Source));
            //await Task.WhenAll(TasksImages);
            //var images = TasksImages.Select(x => x.Result).ToList();

            return new ElasticNoot()
            {
                Id = noot.Id.ToString(),
                Labels = noot.Labels,
                Author = noot.Author,
                Title = noot.Title,
                Date = noot.Date,
                Images = images,
                Description = body
            };
        }
        public  MongoNoot CreateMongoDocument(IDocument document)
        {
            var title = document.GetElementsByClassName("post__title-text").FirstOrDefault().InnerHtml;

            var body = document.GetElementById("post-content-body");

            var blocks = body.OuterHtml.Split("<br>");
       

            var tags = document.GetElementsByClassName("inline-list__item inline-list__item_hub").Select(x => x.TextContent).ToList();

            var time = document.GetElementsByClassName("post__time").FirstOrDefault().OuterHtml.Split('\"').Skip(3).FirstOrDefault().Trim('"');
            var user = document.GetElementsByClassName("user-info__nickname user-info__nickname_small").FirstOrDefault().InnerHtml;

            return new MongoNoot()
            {
                Title = title,
                Author = user,
                Date = Convert.ToDateTime(time),
                Description = body.OuterHtml,
                Labels = tags
            };
        }

        public async Task ParseConcretePages(List<List<string>> ListPages)
        {
            var config = Configuration.Default.WithDefaultLoader();
            var context = BrowsingContext.New(config);
            Console.WriteLine("PAges"+ " " + ListPages.Count());
            foreach(var page in ListPages)
            {
                var tasks = page.Select(x => ParseConcretePage(x));
                await Task.WhenAll(tasks);
                Console.WriteLine("End parsed ConcretePages");
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
                        Thread.Sleep(100);
                        document = await context.OpenAsync(adress);
                    }
                }

                var articles = document.GetElementsByClassName("post__title_link");


                if (articles.Count() < 19)
                {
                    while (articles.Count() < 15)
                    {
                        Console.WriteLine("1");
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

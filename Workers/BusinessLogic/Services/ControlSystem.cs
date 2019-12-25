using BusinessLogic.Interfaces;
using DataAccess.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class ControlSystem : IControlSystem
    {
        IHabr habr;
        IElasticSearch ElasticSearch;
        IQueueService QueueService;
        public ControlSystem(IHabr habr, IElasticSearch ElasticSearch, IQueueService QueueService)
        {
            this.habr = habr;
            this.ElasticSearch = ElasticSearch;
            this.QueueService = QueueService;
        }
        public async Task Run()
        {
            Console.WriteLine(5);
            //var pages = await habr.ParseMainPages(5);
            //await habr.ParseConcretePages(pages);
        }
    }
}

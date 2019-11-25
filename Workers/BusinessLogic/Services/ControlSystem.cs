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
        public ControlSystem(IHabr habr, IElasticSearch ElasticSearch)
        {
            this.habr = habr;
            this.ElasticSearch = ElasticSearch;
        }
        public async Task Run()
        {
            var pages = await habr.ParsePages(1);
            await habr.ParseConcreatePage(pages);
        }
    }
}

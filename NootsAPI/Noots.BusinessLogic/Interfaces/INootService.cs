using Noots.Domain.Elastic;
using Noots.Domain.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Interfaces
{
    public interface INootService
    {
        Task<IEnumerable<ElasticNoot>> GetAllNoots();
        Task<MongoNoot> GetFullNoot(string id);
    }
}

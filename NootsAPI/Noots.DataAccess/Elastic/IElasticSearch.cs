using Nest;
using Noots.Domain.Elastic;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.Elastic
{
    public interface IElasticSearch
    {
        Task<IEnumerable<ElasticNoot>> GetAllNoots();
        Task<CreateResponse> CreateAsync(ElasticNoot item);
        Task CreateCollectionAsync(List<ElasticNoot> items);
    }
}

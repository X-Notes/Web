using Domain.Elastic;
using Nest;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Interfaces
{
    public interface IElasticSearch
    {
        Task<CreateResponse> CreateAsync(ElasticNoot item);
        Task CreateCollectionAsync(List<ElasticNoot> items);
    }
}

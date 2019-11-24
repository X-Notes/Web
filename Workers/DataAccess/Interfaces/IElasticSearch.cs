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
        Task<CreateResponse> CreateAsync(Noot item);
        Task CreateCollectionAsync(List<Noot> items);
    }
}

using AutoMapper;
using Noots.BusinessLogic.Interfaces;
using Noots.DataAccess.Elastic;
using Noots.Domain.Elastic;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class NootService : INootService
    {
        private readonly IMapper mapper;
        private readonly IElasticSearch elasticSearch = null;
        public NootService(IMapper mapper, IElasticSearch elasticSearch)
        {
            this.mapper = mapper;
            this.elasticSearch = elasticSearch;
        }
        public async Task<IEnumerable<ElasticNoot>> GetAllNoots()
        {
            return await elasticSearch.GetAllNoots();
        }
    }
}

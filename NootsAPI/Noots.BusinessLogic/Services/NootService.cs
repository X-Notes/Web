using AutoMapper;
using MongoDB.Bson;
using Noots.BusinessLogic.Interfaces;
using Noots.DataAccess.Elastic;
using Noots.DataAccess.InterfacesRepositories;
using Noots.Domain.Elastic;
using Noots.Domain.Mongo;
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
        private readonly INootRepository nootRepository = null;

        public NootService(IMapper mapper, IElasticSearch elasticSearch, INootRepository nootRepository)
        {
            this.mapper = mapper;
            this.elasticSearch = elasticSearch;
            this.nootRepository = nootRepository;
        }
        public async Task<IEnumerable<ElasticNoot>> GetAllNoots()
        {
            return await elasticSearch.GetAllNoots();
        }
        public async Task<MongoNoot> GetFullNoot(string id)
        {
            var Oid = ObjectId.Parse(id);
            return await nootRepository.GetFullNoot(Oid);
        }
    }
}

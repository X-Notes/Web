﻿using Nest;
using Noots.Domain.Elastic;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.DataAccess.Elastic
{
    public class ElasticSearch : IElasticSearch
    {
        private readonly IElasticClient _elasticClient;

        public ElasticSearch(string indexName, IElasticClient _elasticClient)
        {
            this._elasticClient = _elasticClient;
        }

        public async Task<CreateResponse> CreateAsync(ElasticNoot item)
        {
            return await _elasticClient.CreateDocumentAsync(item);
        }
        public async Task CreateCollectionAsync(List<ElasticNoot> items)
        {
            foreach (var item in items)
            {
                await _elasticClient.CreateDocumentAsync(item);
            }
        }
    }
}

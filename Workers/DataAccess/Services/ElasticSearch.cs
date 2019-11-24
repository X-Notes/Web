using DataAccess.Interfaces;
using Nest;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.Services
{
    public class ElasticSearch : IElasticSearch
    {
        private readonly IElasticClient _elasticClient;

        public ElasticSearch(string indexName, IElasticClient _elasticClient)
        {
            this._elasticClient = _elasticClient;
        }
    }
}

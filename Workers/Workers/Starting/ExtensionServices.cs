using BusinessLogic.Interfaces;
using BusinessLogic.Services;
using DataAccess.Interfaces;
using DataAccess.IRepositories;
using DataAccess.Repositories;
using DataAccess.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nest;
using Shared.Elastic;
using System;
using System.Collections.Generic;
using System.Text;
using NestConnection = Nest.ConnectionSettings;
using NestConnectionSettings = Nest.ConnectionSettings;

namespace Workers.Starting
{
    public static class ExtensionServices
    {
        public static void BusinessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IControlSystem, ControlSystem>();
            services.AddTransient<IHabr, Habr>();
        }
        public static void ElasticService(this IServiceCollection services, IConfiguration configuration)
        {
            string url = configuration["elasticsearch:url"];
            string defaultIndex = configuration["elasticsearch:index"];
            Uri uri = new Uri(url);

            NestConnectionSettings settings = new NestConnectionSettings(uri)
                .DefaultIndex(defaultIndex)
                .DefaultMappingFor<ElasticNoot>(m => m.IdProperty(p => p.Id));

            services.AddSingleton<IElasticClient>(new ElasticClient(settings));
            services.AddSingleton<IElasticSearch>(f => new ElasticSearch(defaultIndex, f.GetService<IElasticClient>()));
        }
        public static void DatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {

            var connection = configuration["Mongo:client"];
            var database = configuration["Mongo:database"];

            services.AddTransient<IUserRepository, UserRepository>(x => new UserRepository(connection, database));
            services.AddTransient<INootRepository, NootRepository>(x => new NootRepository(connection, database));
        }
    }
}

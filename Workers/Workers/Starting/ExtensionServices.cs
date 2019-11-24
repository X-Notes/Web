﻿using BusinessLogic.Interfaces;
using BusinessLogic.Services;
using DataAccess.Interfaces;
using DataAccess.Services;
using Domain.Elastic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nest;
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
            services.AddTransient<IControlSystem, ControlSystem>();
            services.AddTransient<IHabr, Habr>();
        }
        public static void ElasticService(this IServiceCollection services, IConfiguration configuration)
        {
            string url = configuration["elasticsearch:url"];
            string defaultIndex = configuration["elasticsearch:index"];
            Uri uri = new Uri(url);

            NestConnectionSettings settings = new NestConnectionSettings(uri)
                .DefaultIndex(defaultIndex)
                .DefaultMappingFor<Noot>(m => m.IdProperty(p => p.Id));

            services.AddSingleton<IElasticClient>(new ElasticClient(settings));
            services.AddSingleton<IElasticSearch>(f => new ElasticSearch(defaultIndex, f.GetService<IElasticClient>()));

        }
    }
}

using BusinessLogic.Interfaces;
using BusinessLogic.Services;
using DataAccess.Interfaces;
using DataAccess.IRepositories;
using DataAccess.Repositories;
using DataAccess.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nest;
using RabbitMQ.Client;
using Shared.Elastic;
using Shared.RabbitMq.QueueInterfaces;
using Shared.RabbitMq.QueueService;
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

            Console.WriteLine(url);

            NestConnectionSettings settings = new NestConnectionSettings(uri)
                .DefaultIndex(defaultIndex)
                .DefaultMappingFor<ElasticNoot>(m => m.IdProperty(p => p.Id));

            services.AddSingleton<IElasticClient>(new ElasticClient(settings));
            services.AddSingleton<IElasticSearch>(f => new ElasticSearch(defaultIndex, f.GetService<IElasticClient>()));
        }
        public static void DatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {

            var host = configuration["Mongo:Host"];
            var port = configuration["Mongo:Port"];
            var database = configuration["Mongo:Database"];
            var connection = $@"mongodb://{host}:{port}";

            services.AddTransient<IUserRepository, UserRepository>(x => new UserRepository(connection, database));
            services.AddTransient<INootRepository, NootRepository>(x => new NootRepository(connection, database));
        }
        public static void RabbitMQServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IQueueService, QueueService>();

            services.AddScoped<IMessageQueue, MessageQueue>();

            services.AddScoped<IMessageProducer, MessageProducer>();
            services.AddScoped<IMessageProducerScope, MessageProducerScope>();
            services.AddScoped<IMessageProducerScopeFactory, MessageProducerScopeFactory>();

            services.AddScoped<IMessageConsumer, MessageConsumer>();
            services.AddScoped<IMessageConsumerScope, MessageConsumerScope>();
            services.AddScoped<IMessageConsumerScopeFactory, MessageConsumerScopeFactory>();

            Console.WriteLine(configuration["Rabbit"]);

            services.AddScoped<IConnectionFactory>(x => new ConnectionFactory()
            {
                HostName = configuration["Rabbit"],
                UserName = "guest",
                Password = "guest",
                VirtualHost = "/",
                RequestedConnectionTimeout = 30000,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(30),
                AutomaticRecoveryEnabled = true,
                TopologyRecoveryEnabled = true,
                RequestedHeartbeat = 60
            });
        }
    }
}

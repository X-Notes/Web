using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Nest;
using Noots.BusinessLogic.Services;
using Noots.DataAccess.Elastic;
using Noots.DataAccess.Repositories;
using RabbitMQ.Client;
using Shared.RabbitMq.QueueInterfaces;
using Shared.RabbitMq.QueueService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NestConnection = Nest.ConnectionSettings;
using NestConnectionSettings = Nest.ConnectionSettings;

namespace NootsAPI
{
    public static class ServiceConfiguration
    {
        public static void AddSiteAuthentications(this IServiceCollection services, IConfiguration configuration)
        {
            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {

                    options.Authority = configuration["FirebaseOptions:Authority"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = configuration["FirebaseOptions:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = configuration["FirebaseOptions:Audience"],
                        ValidateLifetime = true
                    };
                });
        }
        public static void DatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {

            var host = configuration["Mongo:Host"];
            var port = configuration["Mongo:Port"];
            var database = configuration["Mongo:Database"];
            var connection = $@"mongodb://{host}:{port}";

            services.AddTransient<UserRepository>(x => new UserRepository(connection, database));
            services.AddTransient<LabelRepository>(x => new LabelRepository(connection, database));
        }
        public static void BusinessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<UserService>();
            services.AddScoped<LabelService >();
        }
        public static void ElasticService(this IServiceCollection services, IConfiguration configuration)
        {
            string url = configuration["elasticsearch:url"];
            string defaultIndex = configuration["elasticsearch:index"];
            Uri uri = new Uri(url);

            NestConnectionSettings settings = new NestConnectionSettings(uri)
                .DefaultIndex(defaultIndex);

            services.AddSingleton<IElasticClient>(new ElasticClient(settings));
            services.AddSingleton(f => new ElasticSearch());
        }
        public static void RabbitMQService(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<QueueService>();

            services.AddScoped<IMessageQueue, MessageQueue>();

            services.AddScoped<IMessageProducer, MessageProducer>();
            services.AddScoped<IMessageProducerScope, MessageProducerScope>();
            services.AddScoped<IMessageProducerScopeFactory, MessageProducerScopeFactory>();

            services.AddScoped<IMessageConsumer, MessageConsumer>();
            services.AddScoped<IMessageConsumerScope, MessageConsumerScope>();
            services.AddScoped<IMessageConsumerScopeFactory, MessageConsumerScopeFactory>();

            services.AddScoped<IConnectionFactory>(x => new ConnectionFactory()
            {
                HostName = configuration["Rabbit"],
                UserName = "guest",
                Password = "guest",
                VirtualHost = "/",
                //RequestedConnectionTimeout = 30000,
                //NetworkRecoveryInterval = TimeSpan.FromSeconds(30),
                //AutomaticRecoveryEnabled = true,
                //TopologyRecoveryEnabled = true,
                //RequestedHeartbeat = 60
            });
        }
     }
}

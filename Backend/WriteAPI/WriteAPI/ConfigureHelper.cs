using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.QueueServices;
using System;


namespace WriteAPI
{
    public static class ConfigureHelper
    {
        public static void Queue(this IServiceCollection services, IConfiguration Configuration)
        {
            var uri = Configuration.GetSection("Rabbit").Value;
            services.AddSingleton<IConnectionFactory>(x => new ConnectionFactory()
            {
                Uri = new Uri(uri),
                RequestedConnectionTimeout = TimeSpan.FromTicks(30000),
                NetworkRecoveryInterval = TimeSpan.FromSeconds(30),
                AutomaticRecoveryEnabled = true,
                TopologyRecoveryEnabled = true,
                RequestedHeartbeat = TimeSpan.FromTicks(60),
            });


            services.AddSingleton<IMessageProducerScopeFactory, MessageProducerScopeFactory>();

            services.AddSingleton<IMessageConsumerScopeFactory, MessageConsumerScopeFactory>();
        }
    }
}

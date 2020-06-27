using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Services
{
    public class CommandsPushQueue
    {
        private readonly IMessageProducerScope _messageProducerScope;
        private readonly ILogger<CommandsPushQueue> logger;
        public CommandsPushQueue(IMessageProducerScopeFactory messageProducerScopeFactory, ILogger<CommandsPushQueue> logger)
        {
           _messageProducerScope = messageProducerScopeFactory.Open(new MessageScopeSettings
            {
                ExchangeName = "ServerExchange",
                ExchangeType = ExchangeType.Topic,
                QueueName = "CommandNewUser",
                RoutingKey = "new.user"
           });
            this.logger = logger;
        }

        public void CommandNewUser(string value)
        {
            try
            {
                _messageProducerScope.MessageProducer.Send(value);
            }
            catch (Exception e)
            {
                logger.LogError(e.ToString());
            }
        }
    }
}

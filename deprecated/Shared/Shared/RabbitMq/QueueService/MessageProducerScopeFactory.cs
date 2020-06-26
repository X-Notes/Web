using RabbitMQ.Client;
using Shared.RabbitMq.QueueInterfaces;
using Shared.RabbitMq.QueueModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueService
{
    public class MessageProducerScopeFactory : IMessageProducerScopeFactory
    {
        private readonly IConnectionFactory _connectionFactory;

        public MessageProducerScopeFactory(IConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }
        public IMessageProducerScope Open(MessageScopeSettings messageScopeSettings)
        {
            return new MessageProducerScope(_connectionFactory, messageScopeSettings);
        }
    }
}

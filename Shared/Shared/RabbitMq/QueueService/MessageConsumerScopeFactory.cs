using RabbitMQ.Client;
using Shared.RabbitMq.QueueInterfaces;
using Shared.RabbitMq.QueueModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueService
{
    public class MessageConsumerScopeFactory : IMessageConsumerScopeFactory
    {
        private readonly IConnectionFactory _connectionFactory;

        public MessageConsumerScopeFactory(IConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }
        public IMessageConsumerScope Open(MessageScopeSettings messageScopeSettings)
        {
            return new MessageConsumerScope(_connectionFactory, messageScopeSettings);
        }
        public IMessageConsumerScope Connect(MessageScopeSettings messageConsumerSettings)
        {
            var mqConsumerScope = Open(messageConsumerSettings);
            mqConsumerScope.MessageConsumer.Connect();

            return mqConsumerScope;
        }
    }
}

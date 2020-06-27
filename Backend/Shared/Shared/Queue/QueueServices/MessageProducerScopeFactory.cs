using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;

namespace Shared.Queue.QueueServices
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

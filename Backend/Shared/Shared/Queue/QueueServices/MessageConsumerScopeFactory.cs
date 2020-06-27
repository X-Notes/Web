using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;

namespace Shared.Queue.QueueServices
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

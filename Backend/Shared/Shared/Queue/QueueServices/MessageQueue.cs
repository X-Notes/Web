using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;

namespace Shared.Queue.QueueServices
{
    public class MessageQueue : IMessageQueue
    {
        private readonly IConnection _connection;
        public IModel Channel { get; protected set; }

        public MessageQueue(IConnectionFactory connectionFactory)
        {
            _connection = connectionFactory.CreateConnection();
            Channel = _connection.CreateModel();
        }

        public MessageQueue(IConnectionFactory connectionFactory, MessageScopeSettings messageScopeSettings)
            : this(connectionFactory)
        {
            DeclareExchange(messageScopeSettings.ExchangeName, messageScopeSettings.ExchangeType);

            if (messageScopeSettings.QueueName != null)
            {
                BindQueue(messageScopeSettings.ExchangeName, messageScopeSettings.RoutingKey, messageScopeSettings.QueueName);
            }
        }
        public void DeclareExchange(string ExchangeName, string exchangeType)
        {
            Channel.ExchangeDeclare(ExchangeName, exchangeType ?? string.Empty);
        }
        public void BindQueue(string exchangeName, string routingKey, string queueName)
        {
            Channel.QueueDeclare(queueName, true, false, false);
            Channel.QueueBind(queueName, exchangeName, routingKey);
        }
        public void Dispose()
        {
            Channel?.Dispose();
            _connection?.Dispose();
        }
    }
}

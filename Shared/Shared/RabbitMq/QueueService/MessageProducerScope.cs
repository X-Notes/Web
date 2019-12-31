using RabbitMQ.Client;
using Shared.RabbitMq.QueueInterfaces;
using Shared.RabbitMq.QueueModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueService
{
    public class MessageProducerScope : IMessageProducerScope
    {
        private readonly Lazy<IMessageQueue> _messageQueueLazy;
        private readonly Lazy<IMessageProducer> _messageProducerLazy;

        private readonly MessageScopeSettings _messageScopeSettings;
        private readonly IConnectionFactory _connectionFactory;

        public MessageProducerScope(IConnectionFactory connectionFactory, MessageScopeSettings messageScopeSettings = null)
        {
            _connectionFactory = connectionFactory;
            _messageScopeSettings = messageScopeSettings;

            _messageQueueLazy = new Lazy<IMessageQueue>(CreateMessageQueue);
            _messageProducerLazy = new Lazy<IMessageProducer>(CreateMessageProducer);


        }
        public IMessageProducer MessageProducer => _messageProducerLazy.Value;

        private IMessageQueue MessageQueue => _messageQueueLazy.Value;

        private IMessageQueue CreateMessageQueue()
        {
            return new MessageQueue(_connectionFactory, _messageScopeSettings);
        }
        private IMessageProducer CreateMessageProducer()
        {
            return new MessageProducer(new MessageProducerSettings
            {
                Channel = MessageQueue.Channel,
                PublicationAddress = new PublicationAddress(
                    _messageScopeSettings.ExchangeType,
                    _messageScopeSettings.ExchangeName,
                    _messageScopeSettings.RoutingKey
                    )
            });
        }
        public void Dispose()
        {
            MessageQueue?.Dispose();
        }
    }
}

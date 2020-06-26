using RabbitMQ.Client;
using Shared.RabbitMq.QueueInterfaces;
using Shared.RabbitMq.QueueModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.BusinessLogic.Services
{
    public class QueueService
    {
        private readonly IMessageProducerScope _messageProducerScope;

        public QueueService(IMessageProducerScopeFactory messageProducerScopeFactory)
        {
            _messageProducerScope = messageProducerScopeFactory.Open(new MessageScopeSettings
            {
                ExchangeName = "ServerExchange",
                ExchangeType = ExchangeType.Topic,
                QueueName = "SendValueQueue",
                RoutingKey = "topic.queue"
            });
        }
        public bool PostValue(string value)
        {
            try
            {
                _messageProducerScope.MessageProducer.Send(value);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }
    }
}

using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageQueue : IDisposable
    {
        IModel Channel { get; }
        void DeclareExchange(string ExchangeName, string exchangeType);
        void BindQueue(string exchangeName, string routingKey, string queueName);
    }
}

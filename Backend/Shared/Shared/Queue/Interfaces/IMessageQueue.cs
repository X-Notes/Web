using RabbitMQ.Client;
using System;

namespace Shared.Queue.Interfaces
{
    public interface IMessageQueue : IDisposable
    {
        IModel Channel { get; }
        void DeclareExchange(string ExchangeName, string exchangeType);
        void BindQueue(string exchangeName, string routingKey, string queueName);
    }
}

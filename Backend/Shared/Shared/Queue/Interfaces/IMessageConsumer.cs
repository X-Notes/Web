using RabbitMQ.Client.Events;
using System;

namespace Shared.Queue.Interfaces
{
    public interface IMessageConsumer
    {
        void Connect();
        void SetAcknowledge(ulong deliveryTag, bool processed);
        event EventHandler<BasicDeliverEventArgs> Received;
    }
}

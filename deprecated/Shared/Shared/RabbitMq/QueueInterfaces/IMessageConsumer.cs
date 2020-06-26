using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageConsumer
    {
        void Connect();
        void SetAcknowledge(ulong deliveryTag, bool processed);
        event EventHandler<BasicDeliverEventArgs> Received;
    }
}

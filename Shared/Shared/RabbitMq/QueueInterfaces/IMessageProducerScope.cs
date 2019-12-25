using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageProducerScope : IDisposable
    {
        IMessageProducer MessageProducer { get; }
    }
}

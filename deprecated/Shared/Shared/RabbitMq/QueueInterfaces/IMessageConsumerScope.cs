using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageConsumerScope : IDisposable
    {
        IMessageConsumer MessageConsumer { get; }
    }
}

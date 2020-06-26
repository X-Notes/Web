using Shared.RabbitMq.QueueModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageProducerScopeFactory
    {
        IMessageProducerScope Open(MessageScopeSettings messageScopeSettings);
    }
}

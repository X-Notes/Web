using Shared.RabbitMq.QueueModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageConsumerScopeFactory
    {
        IMessageConsumerScope Connect(MessageScopeSettings messageConsumerSettings);
        IMessageConsumerScope Open(MessageScopeSettings messageScopeSettings);
    }
}

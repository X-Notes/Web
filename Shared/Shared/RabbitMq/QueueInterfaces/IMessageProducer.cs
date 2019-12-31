using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueInterfaces
{
    public interface IMessageProducer
    {
        void Send(string message, string type = null);
        void SendTyped(Type type, string message);
    }
}

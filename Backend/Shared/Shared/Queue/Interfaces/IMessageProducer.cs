using System;

namespace Shared.Queue.Interfaces
{
    public interface IMessageProducer
    {
        void Send(string message, string type = null);
        void SendTyped(Type type, string message);
    }
}

using System;


namespace Shared.Queue.Interfaces
{
    public interface IMessageProducerScope : IDisposable
    {
        IMessageProducer MessageProducer { get; }
    }
}

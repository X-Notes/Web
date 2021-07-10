using System;

namespace Shared.Queue.Interfaces
{
    public interface IMessageConsumerScope : IDisposable
    {
        IMessageConsumer MessageConsumer { get; }
    }
}

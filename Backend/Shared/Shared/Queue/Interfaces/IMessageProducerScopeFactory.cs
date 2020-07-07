using Shared.Queue.Model;

namespace Shared.Queue.Interfaces
{
    public interface IMessageProducerScopeFactory
    {
        IMessageProducerScope Open(MessageScopeSettings messageScopeSettings);
    }
}

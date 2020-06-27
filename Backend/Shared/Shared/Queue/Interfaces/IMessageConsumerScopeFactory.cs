using Shared.Queue.Model;

namespace Shared.Queue.Interfaces
{
    public interface IMessageConsumerScopeFactory
    {
        IMessageConsumerScope Connect(MessageScopeSettings messageConsumerSettings);
        IMessageConsumerScope Open(MessageScopeSettings messageScopeSettings);
    }
}


namespace Shared.Queue.Model
{
    public class MessageScopeSettings
    {
        public string ExchangeName { set; get; }
        public string QueueName { set; get; }
        public string RoutingKey { set; get; }
        public string ExchangeType { set; get; }
    }
}

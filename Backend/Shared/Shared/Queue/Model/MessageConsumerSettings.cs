using RabbitMQ.Client;

namespace Shared.Queue.Model
{
    public class MessageConsumerSettings
    {
        public bool SequentialFetch { set; get; } = true;
        public bool AutoAcknowlegde { set; get; } = false;
        public IModel Channel { set; get; }
        public string QueueName { set; get; }
    }
}

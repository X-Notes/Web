using RabbitMQ.Client;

namespace Shared.Queue.Model
{
    public class MessageProducerSettings
    {
        public IModel Channel { set; get; }
        public PublicationAddress PublicationAddress { set; get; }
    }
}

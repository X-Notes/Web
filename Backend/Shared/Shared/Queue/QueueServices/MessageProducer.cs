using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;
using System;
using System.Text;


namespace Shared.Queue.QueueServices
{
    public class MessageProducer : IMessageProducer
    {
        private readonly MessageProducerSettings _messageProducerSettings;
        private readonly IBasicProperties _properties;

        public MessageProducer(MessageProducerSettings messageProducerSettings)
        {
            _messageProducerSettings = messageProducerSettings;

            _properties = _messageProducerSettings.Channel.CreateBasicProperties();
            _properties.Persistent = true;
        }
        public void Send(string message, string type = null)
        {
            if (!string.IsNullOrEmpty(type))
            {
                _properties.Type = type;
            }
            var body = Encoding.UTF8.GetBytes(message);

            _messageProducerSettings.Channel.BasicPublish(_messageProducerSettings.PublicationAddress, _properties, body);
        }
        public void SendTyped(Type type, string message)
        {
            Send(message, type.AssemblyQualifiedName);
        }
    }
}

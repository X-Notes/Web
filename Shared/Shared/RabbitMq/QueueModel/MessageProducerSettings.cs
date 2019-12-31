using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueModel
{
    public class MessageProducerSettings
    {
        public IModel Channel { set; get; }
        public PublicationAddress PublicationAddress { set; get; }
    }
}

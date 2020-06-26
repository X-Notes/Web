using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.RabbitMq.QueueModel
{
    public class MessageConsumerSettings
    {
        public bool SequentialFetch { set; get; } = true;
        public bool AutoAcknowlegde { set; get; } = false;
        public IModel Channel { set; get; }
        public string QueueName { set; get; }
    }
}

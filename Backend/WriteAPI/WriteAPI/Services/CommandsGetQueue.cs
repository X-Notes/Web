using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Services
{
    public class CommandsGetQueue
    {
        private readonly IMessageConsumerScope _messageConsumerScope;
        private readonly ILogger<CommandsGetQueue> logger;
        public CommandsGetQueue(IMessageConsumerScopeFactory messageConsumerScopeFactory, ILogger<CommandsGetQueue> logger)
        {
            _messageConsumerScope = messageConsumerScopeFactory.Connect(new MessageScopeSettings
            {
                ExchangeName = "ServerExchange",
                ExchangeType = ExchangeType.Topic,
                QueueName = "CommandNewUser",
                RoutingKey = "new.user"
            });
            _messageConsumerScope.MessageConsumer.Received += RegisterUser;
            this.logger = logger;
        }


        private void RegisterUser(object sender, BasicDeliverEventArgs e)
        {
            var processed = false;
            try
            {
                var value = Encoding.UTF8.GetString(e.Body.ToArray());
                logger.LogInformation($"Received {value}");
                processed = true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
                processed = false;
            }
            finally
            {
                _messageConsumerScope.MessageConsumer.SetAcknowledge(e.DeliveryTag, processed);
            }
        }
    }
}

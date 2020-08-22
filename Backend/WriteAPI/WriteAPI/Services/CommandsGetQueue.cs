using BI.services.user;
using Domain.Commands;
using Domain.Ids;
using Domain.Models;
using Domain.Repository;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Shared.Queue.Interfaces;
using Shared.Queue.Model;
using System;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WriteAPI.Services
{
    /*
    var deserialized = JsonConvert.DeserializeObject<CommandGet>(value);
    var messageType = Type.GetType($"{deserialized.Type}");
    var type = JsonConvert.DeserializeObject(Convert.ToString(deserialized.Data), messageType);
    */
    public class CommandsGetQueue : BackgroundService
    {
        private IMessageConsumerScope _messageConsumerScope;
        private readonly ILogger<CommandsGetQueue> logger;
        private readonly IMessageConsumerScopeFactory _messageConsumerScopeFactory;
        private readonly IServiceScopeFactory serviceScopeFactory;       
        public CommandsGetQueue(IMessageConsumerScopeFactory messageConsumerScopeFactory, ILogger<CommandsGetQueue> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            this.logger = logger;
            this._messageConsumerScopeFactory = messageConsumerScopeFactory;
            this.serviceScopeFactory = serviceScopeFactory;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();

            _messageConsumerScope = _messageConsumerScopeFactory.Connect(new MessageScopeSettings
            {
                ExchangeName = "ServerExchange",
                ExchangeType = ExchangeType.Topic,
                QueueName = "CommandUser",
                RoutingKey = "user"
            });
            _messageConsumerScope.MessageConsumer.Received += async (sender, e) => await HandleUser(sender, e);

            return Task.CompletedTask;
        }

        private async Task HandleUser(object sender, BasicDeliverEventArgs e)
        {
            var processed = true;
            try
            {
                var value = Encoding.UTF8.GetString(e.Body.ToArray());
                logger.LogInformation($"Received {value}");

                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var service = scope.ServiceProvider.GetRequiredService<UserHandlerСommand>();
                    // await service.HandleRaw(value);
                    await Task.Delay(500);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
            }
            finally
            {
                _messageConsumerScope.MessageConsumer.SetAcknowledge(e.DeliveryTag, processed);
            }
        }
    }
}
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
                QueueName = "CommandNewUser",
                RoutingKey = "new.user"
            });
            _messageConsumerScope.MessageConsumer.Received += async (sender, e) => await RegisterUser(sender, e);

            return Task.CompletedTask;
        }

        private async Task RegisterUser(object sender, BasicDeliverEventArgs e)
        {
            var processed = false;
            try
            {
                var value = Encoding.UTF8.GetString(e.Body.ToArray());
                logger.LogInformation($"Received {value}");
                await HandleDefineObject(value);
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
        private async Task HandleDefineObject(string value)
        {

            var deserialized = JsonConvert.DeserializeObject<CommandGet>(value);
            var messageType = Type.GetType($"{deserialized.Type}");
            var type = JsonConvert.DeserializeObject(Convert.ToString(deserialized.Data), messageType);
            switch (type)
            {
                case NewUser command:
                {
                    await AddUser(command);
                    break;
                }
                case UpdateMainUserInfo command:
                {
                    await UpdateUserInfo(command);
                    break;
                }
            }       
        }
        private async Task AddUser(NewUser user)
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var repository = scope.ServiceProvider.GetRequiredService<IRepository<User>>();
                var temp = new User();
                temp.Create(user.Name, user.Email, user.Language, user.Id);
                await repository.Add(temp);
            }
        }
        private async Task UpdateUserInfo(UpdateMainUserInfo info)
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var repository = scope.ServiceProvider.GetRequiredService<IRepository<User>>();
                var find = await repository.Find(info.Id);
                Console.WriteLine("Version: " + find.Version);
                Console.WriteLine("Name: " + find.Name);
                Console.WriteLine("Email: " + find.Email);
                Console.WriteLine("Id: " + find.Id);
                var syka = await repository.Query();
                Console.WriteLine(syka);
                find.UpdateMainInfo(info);
                await repository.Update(find);
            }
        }
    }
}
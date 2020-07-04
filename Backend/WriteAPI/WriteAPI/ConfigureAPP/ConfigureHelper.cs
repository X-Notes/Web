using BI.services;
using Domain.Commands;
using Domain.Ids;
using Domain.Models;
using Domain.Repository;
using Marten;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using RabbitMQ.Client;
using Shared.Queue.Interfaces;
using Shared.Queue.QueueServices;
using System;
using WriteAPI.Services;
using WriteContext;
using WriteContext.Repositories;

namespace WriteAPI.ConfigureAPP
{
    public static class ConfigureHelper
    {
        public static void Queue(this IServiceCollection services, IConfiguration Configuration)
        {
            var uri = Configuration.GetSection("Rabbit").Value;
            services.AddSingleton<RabbitMQ.Client.IConnectionFactory>(x => new RabbitMQ.Client.ConnectionFactory()
            {
                Uri = new Uri(uri),
                RequestedConnectionTimeout = TimeSpan.FromTicks(30000),
                NetworkRecoveryInterval = TimeSpan.FromSeconds(30),
                AutomaticRecoveryEnabled = true,
                TopologyRecoveryEnabled = true,
                RequestedHeartbeat = TimeSpan.FromTicks(60),
            });


            services.AddSingleton<IMessageProducerScopeFactory, MessageProducerScopeFactory>();
            services.AddSingleton<IMessageConsumerScopeFactory, MessageConsumerScopeFactory>();

            services.AddSingleton<CommandsPushQueue>();
            services.AddHostedService<CommandsGetQueue>();
        }
        public static void Marten(this IServiceCollection services, IConfiguration Configuration)
        {
            var connection = Configuration.GetSection("EventStore").Value;
            services.AddMarten(opts =>
            {
                opts.Connection(connection);
                opts.AutoCreateSchemaObjects = AutoCreate.All;

                opts.Events.AsyncProjections.AggregateStreamsWith<User>();

                opts.Events.AddEventType(typeof(NewUser));
                opts.Events.AddEventType(typeof(UpdateMainUserInfo));

            });

            services.AddScoped<IIdGenerator, MartenIdGenerator>();
            services.AddTransient<IRepository<User>, MartenRepository<User>>();
        }
        public static void Mediatr(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Startup));


            services.AddScoped<IRequestHandler<NewUser, Unit>, UserHandlerСommand>();
        }
        public static void DataBase(this IServiceCollection services, IConfiguration Configuration)
        {
            string writeConnection = Configuration.GetSection("WriteDB").Value;
            services.AddDbContext<WriteContextDB>(options => options.UseNpgsql(writeConnection));
            services.AddTransient<LabelRepository>();
            services.AddTransient<UserRepository>();
        }
        public static void JWT(this IServiceCollection services, IConfiguration Configuration)
        {
            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {

                    options.Authority = Configuration["FirebaseOptions:Authority"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = Configuration["FirebaseOptions:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = Configuration["FirebaseOptions:Audience"],
                        ValidateLifetime = true
                    };
                });
        }
    }
}

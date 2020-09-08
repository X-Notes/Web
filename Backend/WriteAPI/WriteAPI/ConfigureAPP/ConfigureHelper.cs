using BI.helpers;
using BI.services;
using BI.services.backgrounds;
using BI.services.folders;
using BI.services.labels;
using BI.services.notes;
using BI.services.user;
using Common.DTO.backgrounds;
using Common.DTO.folders;
using Common.DTO.labels;
using Common.DTO.notes;
using Common.DTO.users;
using Domain.Commands.backgrounds;
using Domain.Commands.folders;
using Domain.Commands.labels;
using Domain.Commands.notes;
using Domain.Commands.orders;
using Domain.Commands.users;
using Domain.Ids;
using Domain.Models;
using Domain.Queries.backgrounds;
using Domain.Queries.folders;
using Domain.Queries.labels;
using Domain.Queries.notes;
using Domain.Queries.users;
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
using System.Collections.Generic;
using System.Threading.Tasks;
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

                opts.Events.AddEventType(typeof(NewUserCommand));
                opts.Events.AddEventType(typeof(UpdateMainUserInfoCommand));

            });

            services.AddScoped<IIdGenerator, MartenIdGenerator>();
            services.AddTransient<IRepository<User>, MartenRepository<User>>();
        }
        public static void Mediatr(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Startup));

            // USER
            services.AddScoped<IRequestHandler<GetShortUser, ShortUser>, UserHandlerQuery>();

            services.AddScoped<IRequestHandler<NewUserCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateMainUserInfoCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdatePhotoCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateLanguageCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateThemeCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateFontSizeCommand, Unit>, UserHandlerСommand>();

            // Backgrounds
            services.AddScoped<IRequestHandler<RemoveBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<DefaultBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<NewBackgroundCommand, BackgroundDTO>, BackgroundHandlerCommand>();

            services.AddScoped<IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>, BackgroundHandlerQuery>();

            //Labels
            services.AddScoped<IRequestHandler<GetLabelsByEmail, LabelsDTO>, LabelHandlerQuery>();

            services.AddScoped<IRequestHandler<NewLabelCommand, int>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeletedLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<RestoreLabelCommand, Unit>, LabelHandlerCommand>();

            //Notes
            services.AddScoped<IRequestHandler<NewPrivateNoteCommand, string>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeColorNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteNotesCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<RestoreNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<ArchiveNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePrivateNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePublicNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyNoteCommand, List<SmallNote>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveLabelFromNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<AddLabelOnNoteCommand, Unit>, NoteHandlerCommand>();

            services.AddScoped<IRequestHandler<GetPrivateNotesQuery, List<SmallNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetSharedNotesQuery, List<SmallNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetDeletedNotesQuery, List<SmallNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetArchiveNotesQuery, List<SmallNote>>, NoteHandlerQuery>();

            services.AddScoped<IRequestHandler<GetFullNoteQuery, FullNote>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetOnlineUsersOnNote, List<OnlineUserOnNote>>, NoteHandlerQuery>();

            //FOLDERS
            services.AddScoped<IRequestHandler<NewFolderCommand, string>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<ArchiveFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeColorFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<RestoreFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyFolderCommand, List<SmallFolder>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteFoldersCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePrivateFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePublicFolderCommand, Unit>, FolderHandlerCommand>();

            services.AddScoped<IRequestHandler<GetPrivateFoldersQuery, List<SmallFolder>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetSharedFoldersQuery, List<SmallFolder>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetDeletedFoldersQuery, List<SmallFolder>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetArchiveFoldersQuery, List<SmallFolder>>, FolderHandlerQuery>();

            //Order
            services.AddScoped<IRequestHandler<UpdateOrderCommand, Unit>, OrderHandlerCommand>();

        }
        public static void DataBase(this IServiceCollection services, IConfiguration Configuration)
        {
            string writeConnection = Configuration.GetSection("WriteDB").Value;
            Console.WriteLine(writeConnection);
            services.AddDbContext<WriteContextDB>(options => options.UseNpgsql(writeConnection));
            services.AddTransient<LabelRepository>();
            services.AddTransient<UserRepository>();
            services.AddTransient<BackgroundRepository>();
            services.AddTransient<NoteRepository>();
            services.AddTransient<FolderRepository>();
            services.AddTransient<UserOnNoteRepository>();
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

                    options.Events = new JwtBearerEvents()
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/hub")))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        },
                    };
                });
        }
        public static void BI(this IServiceCollection services)
        {
            services.AddScoped<PhotoHelpers>();
        }
    }
}

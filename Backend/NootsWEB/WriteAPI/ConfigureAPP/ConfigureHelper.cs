using FakeData;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Threading.Tasks;
using Noots.Auth.Impl;
using Noots.Backgrounds;
using Noots.Billing;
using Serilog;
using Serilog.Sinks.Elasticsearch;
using Noots.Encryption.Entities;
using Noots.Permissions;
using Noots.Storage;
using Noots.History;
using Noots.Encryption;
using Noots.Folders;
using Noots.Labels;
using Noots.Notes;
using Noots.Search;
using Noots.Personalization;
using Noots.RelatedNotes;
using Noots.Users;
using Noots.Sharing;
using Noots.SignalrUpdater;
using Common.Redis;
using Noots.Notifications;
using Noots.Editor.Services;
using Noots.Editor;

namespace Noots.API.ConfigureAPP
{
    public static class ConfigureHelper
    {

        public static void Mediatr(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Program));

            // USER
            services.ApplyUsersDI();

            // Backgrounds
            services.ApplyBackgroundsDI();

            //Labels
            services.ApplyLabelsDI();

            //Notes
            services.ApplyNotesDI();


            // RELATED NOTES
            services.ApplyRelatedNotesDI();

            services.ApplyEditorModulesDI();

            //FOLDERS
            services.ApplyFoldersDI();

            //SHARE
            services.ApplySharingDI();

            //LOCK
            services.ApplyEncryptionDI();

            // HISTORY
            services.ApplyHistorysDI();

            // SEARCH
            services.ApplySearchDI();

            //Files
            services.ApplyStorageDI();

            // Permissions
            services.ApplyPermissionsDI();

            // Personalizations
            services.ApplyPersonalizationDI();

            // Billing
            services.ApplyBillingDI();

            // Notifications 
            services.ApplyNotificationsModule();
        }

        public static void SetupLogger(this IServiceCollection services, IConfiguration configuration, string environment)
        {
            var elasticConnString = configuration["ElasticConfiguration:Uri"];
            Log.Logger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .WriteTo.Debug()
                .WriteTo.Console()
                .WriteTo.Elasticsearch(ConfigureElasticSink(elasticConnString, environment))
                .Enrich.WithProperty("Environment", environment)
                .ReadFrom.Configuration(configuration)
                .CreateLogger();
        }

        private static ElasticsearchSinkOptions ConfigureElasticSink(string elasticConnString, string environment)
        {
            return new ElasticsearchSinkOptions(new Uri(elasticConnString))
            {
                AutoRegisterTemplate = true,
                IndexFormat = $"NOOTS-API-{environment?.ToUpper().Replace(".", "-")}-{DateTime.UtcNow:yyyy-MM-dd}"
            };
        }


        public static void TimersConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var unlockConfig = Configuration.GetSection("UnlockConfig").Get<UnlockConfig>();
            services.AddSingleton(x => unlockConfig);
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
                                path.StartsWithSegments(HubSettings.endPoint))
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
            services.AddScoped<FirebaseAuthService>();
            services.AddScoped<UserGenerator>();
            services.AddScoped<DatabaseFakeDataBridge>();
            services.AddScoped<CollectionLinkedService>();
        }

        public static void SetupSignalR(this IServiceCollection services, RedisConfig config)
        {
            var signalR = services.AddSignalR();

            if (config.Active)
            {
                signalR.AddStackExchangeRedis(config.Connection, options =>
                    {
                        options.Configuration.ChannelPrefix = "Noots-";
                    });
            }
        }
    }
}

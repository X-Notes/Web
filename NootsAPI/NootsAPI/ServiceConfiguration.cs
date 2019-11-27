using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Nest;
using Noots.BusinessLogic.Interfaces;
using Noots.BusinessLogic.Services;
using Noots.DataAccess.Elastic;
using Noots.DataAccess.InterfacesRepositories;
using Noots.DataAccess.Repositories;
using Noots.Domain.Elastic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NestConnection = Nest.ConnectionSettings;
using NestConnectionSettings = Nest.ConnectionSettings;

namespace NootsAPI
{
    public static class ServiceConfiguration
    {
        public static void AddSiteAuthentications(this IServiceCollection services, IConfiguration configuration)
        {
            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {

                    options.Authority = configuration["FirebaseOptions:Authority"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = configuration["FirebaseOptions:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = configuration["FirebaseOptions:Audience"],
                        ValidateLifetime = true
                    };
                });
        }
        public static void DatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {

            var connection = configuration["Mongo:client"];
            var database = configuration["Mongo:database"];

            services.AddTransient<IUserRepository, UserRepository>(x => new UserRepository(connection, database));
            services.AddTransient<INootRepository, NootRepository>(x => new NootRepository(connection, database));
        }
        public static void BusinessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<INootService, NootService>();
        }
        public static void ElasticService(this IServiceCollection services, IConfiguration configuration)
        {
            string url = configuration["elasticsearch:url"];
            string defaultIndex = configuration["elasticsearch:index"];
            Uri uri = new Uri(url);

            NestConnectionSettings settings = new NestConnectionSettings(uri)
                .DefaultIndex(defaultIndex)
                .DefaultMappingFor<ElasticNoot>(m => m.IdProperty(p => p.Id));

            services.AddSingleton<IElasticClient>(new ElasticClient(settings));
            services.AddSingleton<IElasticSearch>(f => new ElasticSearch(defaultIndex, f.GetService<IElasticClient>()));
        }
    }
}

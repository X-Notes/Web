using BusinessLogic.Interfaces;
using BusinessLogic.Services;
using DataAccess.Interfaces;
using DataAccess.Services;
using Domain.Elastic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using NestConnection = Nest.ConnectionSettings;



namespace Workers.Starting
{
    public class RegisterServices
    {
        private readonly IConfiguration Configuration;
        public IServiceCollection services { set; get; }

        public RegisterServices()
        {
            Configuration = new ConfigurationBuilder()
                                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                                .AddJsonFile("appsettings.json")
                                .AddEnvironmentVariables()
                                .Build();
            services = new ServiceCollection();

            services.ElasticService(Configuration);
            services.BusinessServices(Configuration);


            services.AddHttpClient<IDownloadImagesService, DownloadImagesService>();

        }
    }
}

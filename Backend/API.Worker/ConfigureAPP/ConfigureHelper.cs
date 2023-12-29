using API.Worker.BI;
using API.Worker.Hosted;
using API.Worker.Models.Config;
using Common;
using Hangfire;
using Hangfire.PostgreSql;
using Serilog;

namespace API.Worker.ConfigureAPP
{
    public static class ConfigureHelper
    {
        public static void HangFireConfig(this IServiceCollection services, string connectionString)
        {
            // Add Hangfire services.
            services.AddHangfire(configuration => configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(connectionString));

            // Add the processing server as IHostedService
            services.AddHangfireServer();
        }

        public static void TimersConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var configService = Configuration.GetSection("JobsTimers").Get<JobsTimerConfig>();
            services.AddSingleton(x => configService);
        }
        
        public static void SetupLogger(this IServiceCollection services, IConfiguration configuration, string environment, SeqConfig seqConfig)
        {
            var baseLogger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .Enrich.WithProperty("Environment", environment)
                .Enrich.WithClientIp()
                .Enrich.WithCorrelationId()
                .ReadFrom.Configuration(configuration);

            if (environment != "Dev" && environment != "Production")
            {
                baseLogger
                    .WriteTo.Debug()
                    .WriteTo.Console();
            }
            
            if (!string.IsNullOrEmpty(seqConfig?.ApiKey) && !string.IsNullOrEmpty(seqConfig?.ServerUrl))
            {
                Console.WriteLine($"Seq configured: {seqConfig.ApplicationName}");
                Log.Logger = baseLogger
                    .Enrich.WithProperty("ApplicationName", seqConfig.ApplicationName)
                    .WriteTo.Seq(seqConfig.ServerUrl, apiKey: seqConfig.ApiKey)
                    .CreateLogger(); 
            }
            else
            {
                Console.WriteLine("elastic and seq configs are null");
                Log.Logger = baseLogger.CreateLogger();
            }
        }

        public static void JOBS(this IServiceCollection services)
        {
            services.AddScoped<NotesJobHandler>();
            services.AddScoped<FoldersJobHandler>();
            services.AddScoped<LabelsJobHandler>();
            services.AddScoped<RemoveExpiredTokensHandler>();
            services.AddScoped<UnlinkedFilesDeleteJobHandler>();
            services.AddScoped<RemoveDeadWSConnectionsHandler>();
            services.AddScoped<MarkLostFilesAsUnlinkedJobHandler>();

            services.AddHostedService<JobRegisterHosted>();
        }
    }
}

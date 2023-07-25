using Hangfire;
using Hangfire.PostgreSql;
using Noots.API.Workers.BI;
using Noots.API.Workers.Hosted;
using Noots.API.Workers.Models.Config;

namespace Noots.API.Workers.ConfigureAPP
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

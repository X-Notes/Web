using API.Worker.BI;
using API.Worker.Hosted;
using API.Worker.Models.Config;
using Hangfire;
using Hangfire.PostgreSql;

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

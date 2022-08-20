using Microsoft.Extensions.DependencyInjection;
using Noots.SignalrUpdater.Impl;

namespace Noots.SignalrUpdater
{
    public static class SignalrUpdaterModules
    {
        public static void ApplySignalRDI(this IServiceCollection services)
        {
            services.AddScoped<AppSignalRService>();
            services.AddScoped<FolderWSUpdateService>();
            services.AddScoped<NoteWSUpdateService>();

            services.AddSingleton<WebsocketsNotesServiceStorage>();
            services.AddSingleton<WebsocketsFoldersServiceStorage>();
        }
    }
}
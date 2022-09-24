using Microsoft.Extensions.DependencyInjection;
using Noots.SignalrUpdater.Impl;
using Noots.SignalrUpdater.Impl.NoteFolderStates.MemoryStorage;

namespace Noots.SignalrUpdater
{
    public static class SignalrUpdaterModules
    {
        public static void ApplySignalRDI(this IServiceCollection services)
        {
            services.AddScoped<AppSignalRService>();
            services.AddScoped<FolderWSUpdateService>();
            services.AddScoped<NoteWSUpdateService>();

            services.AddSingleton<WSMemoryNotesServiceStorage>();
            services.AddSingleton<WSMemoryFoldersServiceStorage>();
        }
    }
}
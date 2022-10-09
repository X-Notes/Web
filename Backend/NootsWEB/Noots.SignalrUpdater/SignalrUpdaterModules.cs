using Microsoft.Extensions.DependencyInjection;
using Noots.SignalrUpdater.Impl;
using Noots.SignalrUpdater.Impl.NoteFolderStates.DBStorage;
using Noots.SignalrUpdater.Interfaces;

namespace Noots.SignalrUpdater
{
    public static class SignalrUpdaterModules
    {
        public static void ApplySignalRDI(this IServiceCollection services)
        {
            services.AddScoped<AppSignalRService>();
            services.AddScoped<FolderWSUpdateService>();
            services.AddScoped<NoteWSUpdateService>();

            services.AddScoped<INoteServiceStorage, WSNoteServiceStorage>();
            services.AddScoped<IFolderServiceStorage, WSFolderServiceStorage>();
        }
    }
}
using Microsoft.Extensions.DependencyInjection;
using SignalrUpdater.Impl;
using SignalrUpdater.Impl.NoteFolderStates.DBStorage;
using SignalrUpdater.Interfaces;

namespace SignalrUpdater
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
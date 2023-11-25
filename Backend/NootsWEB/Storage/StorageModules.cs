using Common.Azure;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Common.DTO.Files;
using ContentProcessing;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Storage.Commands;
using Storage.Impl;
using Storage.Impl.AzureStorage;
using Storage.Interfaces;
using Storage.Queries;

namespace Storage
{
    public static class StorageModules
    {
        public static void ApplyStorageDI(this IServiceCollection services)
        {
            // QUERY
            services.AddScoped<IRequestHandler<GetFileByPathQuery, FilesBytes>, FilesHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserStorageMemoryQuery, GetUserMemoryResponse>, FilesHandlerQuery>();

            // COMMANDS
            services.AddScoped<IRequestHandler<SavePhotosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveVideosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyBlobFromContainerToContainerCommand, (bool success, AppFile file)>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveDocumentsToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveBackgroundCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveUserPhotoCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateFileMetaDataCommand, OperationResult<FileDTO>>, FileHandlerCommand>();

            ApplyFileRemoving(services);
        }

        public static void ApplyFileRemoving(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<RemoveFilesCommand, Unit>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveFilesFromStorageCommand, Unit>, FileHandlerCommand>();

            // STORAGE
            services.AddScoped<IFilesStorage, AzureFileStorage>();

            services.AddScoped<IImageProcessor, ImageProcessor>();

            services.AddSingleton<StorageIdProvider>();
            services.AddSingleton<PathStorageBuilder>();
        }

        public static void ApplyAzureConfig(this IServiceCollection services, AzureConfig config)
        {
            services.AddSingleton(x => config);
        }
    }
}
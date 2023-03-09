using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Noots.DatabaseContext.GenericRepositories;
using Noots.DatabaseContext.Repositories;
using Noots.DatabaseContext.Repositories.Billing;
using Noots.DatabaseContext.Repositories.Files;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Notifications;
using Noots.DatabaseContext.Repositories.Users;
using Noots.DatabaseContext.Repositories.WS;

namespace Noots.DatabaseContext
{
    public static class DatabaseContextModules
    {
        public static void ApplyDataBaseDI(this IServiceCollection services, string dbConnection)
        {
            services.AddDbContext<NootsDBContext>(options =>
            {
                options.UseNpgsql(dbConnection);
            });

            // NOTIFICATIONS 
            services.AddScoped<NotificationRepository>();

            // USERS
            services.AddScoped<UserRepository>();
            services.AddScoped<BackgroundRepository>();
            services.AddScoped<UserProfilePhotoRepository>();
            
            // BILLING
            services.AddSingleton<BillingPlanCacheRepository>();

            // FILES
            services.AddScoped<FileRepository>();
            services.AddScoped<AppFileUploadInfoRepository>();
            services.AddSingleton<StorageRepository>();

            // APP
            services.AddScoped<AppRepository>();


            // NOTES
            services.AddScoped<NoteRepository>();
            services.AddScoped<RelatedNoteToInnerNoteRepository>();
            services.AddScoped<RelatedNoteUserStateRepository>();
            services.AddScoped<UsersOnPrivateNotesRepository>();

            //LABELS
            services.AddScoped<LabelRepository>();
            services.AddScoped<LabelsNotesRepository>();

            // FOLDERS
            services.AddScoped<FolderRepository>();
            services.AddScoped<UsersOnPrivateFoldersRepository>();
            services.AddScoped<FoldersNotesRepository>();

            // Note Content 
            services.AddScoped<CollectionNoteRepository>();
            services.AddScoped<CollectionAppFileRepository>();

            services.AddScoped<TextNotesRepository>();
            services.AddScoped<BaseNoteContentRepository>();
            services.AddScoped<SearchRepository>();

            // History
            services.AddScoped<NoteSnapshotRepository>();
            services.AddScoped<UserNoteHistoryManyToManyRepository>();
            services.AddScoped<SnapshotFileContentRepository>();
            services.AddScoped<CacheNoteHistoryRepository>();

            // Personalization
            services.AddScoped<PersonalizationSettingRepository>();

            // WS
            services.AddScoped<UserIdentifierConnectionIdRepository>();
            services.AddScoped<FolderConnectionRepository>();
            services.AddScoped<NoteConnectionRepository>();

            services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        }
    }
}

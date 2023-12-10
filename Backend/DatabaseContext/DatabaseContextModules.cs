using DatabaseContext.Dapper;
using DatabaseContext.Dapper.Reps;
using DatabaseContext.GenericRepositories;
using DatabaseContext.Repositories;
using DatabaseContext.Repositories.Billing;
using DatabaseContext.Repositories.Files;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Histories;
using DatabaseContext.Repositories.Labels;
using DatabaseContext.Repositories.NoteContent;
using DatabaseContext.Repositories.Notes;
using DatabaseContext.Repositories.Notifications;
using DatabaseContext.Repositories.Sec;
using DatabaseContext.Repositories.Users;
using DatabaseContext.Repositories.WS;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DatabaseContext
{
    public static class DatabaseContextModules
    {
        public static void DapperDI(this IServiceCollection services, string dbConnection)
        {
            services.AddSingleton(x => new DapperContext(dbConnection));

            services.AddScoped(typeof(IDapperRepository<,>), typeof(DapperRepository<,>));
            services.AddScoped<DapperSearchRepository>();
            services.AddScoped<DapperRefreshTokenRepository>();
        }

        public static void ApplyDataBaseDI(this IServiceCollection services, string dbConnection)
        {
            services.AddDbContext<ApiDbContext>(options => options.UseNpgsql(dbConnection));

            // NOTIFICATIONS 
            services.AddScoped<NotificationRepository>();

            // USERS
            services.AddScoped<UserRepository>();
            services.AddScoped<BackgroundRepository>();
            services.AddScoped<UserProfilePhotoRepository>();

            // SEC
            services.AddScoped<RefreshTokenRepository>();

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
            services.AddScoped<CollectionAppFileRepository>();
            
            services.AddScoped<TextNoteIndexRepository>();
            services.AddScoped<BaseNoteContentRepository>();

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

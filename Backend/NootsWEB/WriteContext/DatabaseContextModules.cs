using Microsoft.Extensions.DependencyInjection;
using WriteContext.GenericRepositories;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Notifications;
using WriteContext.Repositories.Users;
using WriteContext.Repositories.WS;
using WriteContext.Repositories;
using Microsoft.EntityFrameworkCore;

namespace WriteContext
{
    public static class DatabaseContextModules
    {
        public static void ApplyDataBaseDI(this IServiceCollection services, string dbConnection)
        {
            services.AddDbContext<WriteContextDB>(options => options.UseNpgsql(dbConnection));

            // NOTIFICATIONS 
            services.AddScoped<NotificationRepository>();

            // USERS
            services.AddScoped<UserRepository>();
            services.AddScoped<BackgroundRepository>();
            services.AddScoped<UserProfilePhotoRepository>();
            services.AddScoped<BillingPlanRepository>();

            // FILES
            services.AddScoped<FileRepository>();
            services.AddScoped<AppFileUploadInfoRepository>();


            // APP
            services.AddScoped<AppRepository>();


            // NOTES
            services.AddScoped<NoteRepository>();
            services.AddScoped<ReletatedNoteToInnerNoteRepository>();
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
            services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        }
    }
}

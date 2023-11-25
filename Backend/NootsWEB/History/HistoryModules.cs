using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using History.Commands;
using History.Entities;
using History.Handlers.Commands;
using History.Handlers.Queries;
using History.Impl;
using History.Queries;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace History
{
    public static class HistoryModules
    {
        public static void ApplyHistorysDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetNoteHistoriesQuery, OperationResult<List<NoteHistoryDTO>>>, GetNoteHistoriesQueryHandler>();
            services.AddScoped<IRequestHandler<GetNoteSnapshotQuery, OperationResult<NoteHistoryDTOAnswer>>, GetNoteSnapshotQueryHandler>();
            services.AddScoped<IRequestHandler<GetSnapshotContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, GetSnapshotContentsQueryHandler>();

            ApplyMakeHistoryDI(services);
        }

        public static void ApplyMakeHistoryDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<MakeNoteHistoryCommand, Unit>, MakeNoteHistoryCommandHandler>();
            services.AddScoped<HistoryCacheService>();
        }
    }
}

using Common.DTO.Notes.FullNoteContent;
using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.History.Queries;
using Noots.History.Entities;
using Noots.History.Impl;
using Noots.History.Commands;
using Noots.History.Handlers.Commands;
using Noots.History.Handlers.Queries;

namespace Noots.History
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

using Common.DTO.Notes.FullNoteContent;
using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.History.Queries;
using Noots.History.Entities;
using Noots.History.Impl;
using Noots.History.Commands;

namespace Noots.History
{
    public static class HistoryModules
    {
        public static void ApplyHistorysDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetNoteHistoriesQuery, OperationResult<List<NoteHistoryDTO>>>, HistoryHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNoteSnapshotQuery, OperationResult<NoteHistoryDTOAnswer>>, HistoryHandlerQuery>();
            services.AddScoped<IRequestHandler<GetSnapshotContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, HistoryHandlerQuery>();

            ApplyMakeHistoryDI(services);
        }

        public static void ApplyMakeHistoryDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<MakeNoteHistoryCommand, Unit>, HistoryHandlerCommand>();
            services.AddScoped<HistoryCacheService>();
        }
    }
}

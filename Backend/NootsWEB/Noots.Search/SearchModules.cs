using Common.DTO.Notes;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Search.Entities;
using Noots.Search.Impl;
using Noots.Search.Queries;

namespace Noots.Search
{
    public static class SearchModules
    {
        public static void ApplySearchDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>, SearchQueryHandler>();
            services.AddScoped<IRequestHandler<GetNotesAndFolderForSearchQuery, SearchNoteFolderResult>, SearchQueryHandler>();

            services.AddScoped<IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>, SearchQueryHandler>();
            services.AddScoped<IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>, SearchQueryHandler>();
        }

    }
}
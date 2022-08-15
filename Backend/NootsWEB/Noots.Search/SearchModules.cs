using Common.DTO.Notes;
using Domain.Queries.InnerFolder;
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
            services.AddScoped<IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>, SeachQueryHandler>();
            services.AddScoped<IRequestHandler<GetNotesAndFolderForSearchQuery, SearchNoteFolderResult>, SeachQueryHandler>();

            services.AddScoped<IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>, SeachQueryHandler>();
            services.AddScoped<IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>, SeachQueryHandler>();
        }

    }
}
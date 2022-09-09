using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.RelatedNotes.Commands;
using Noots.RelatedNotes.Handlers.Commands;
using Noots.RelatedNotes.Handlers.Queries;
using Noots.RelatedNotes.Queries;

namespace Noots.RelatedNotes;

public static class RelatedNotesModules
{
    public static void ApplyRelatedNotesDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>, UpdateRelatedNoteStateCommandHandler>();
        services.AddScoped<IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<UpdateRelatedNotesWS>>, UpdateRelatedNotesToNoteCommandHandler>();
        services.AddScoped<IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>, ChangeOrderRelatedNotesCommandHandler>();       
        
        services.AddScoped<IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>, GetRelatedNotesQueryHandler>();
    }
}
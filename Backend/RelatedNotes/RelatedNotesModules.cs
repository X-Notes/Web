using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using RelatedNotes.Commands;
using RelatedNotes.Handlers.Commands;
using RelatedNotes.Handlers.Queries;
using RelatedNotes.Queries;

namespace RelatedNotes;

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
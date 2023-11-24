using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using MapperLocked;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Notes.Queries;
using Permissions.Queries;

namespace Notes.Handlers.Queries;

public class GetNotesByNoteIdsQueryHandler: IRequestHandler<GetNotesByNoteIdsQuery, OperationResult<List<SmallNote>>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly MapperLockedEntities mapperLockedEntities;

    public GetNotesByNoteIdsQueryHandler(IMediator mediator, NoteRepository noteRepository, MapperLockedEntities mapperLockedEntities)
    {
        this.mediator = mediator;
        this.noteRepository = noteRepository;
        this.mapperLockedEntities = mapperLockedEntities;
    }
    
    public async Task<OperationResult<List<SmallNote>>> Handle(GetNotesByNoteIdsQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var canReadIds = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();
        if (canReadIds.Any())
        {
            var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(canReadIds, request.Settings);
            notes.ForEach(note =>
            {
                if(note.UserId != request.UserId)
                {
                    note.NoteTypeId = NoteTypeENUM.Shared;
                }
            });

            var result = mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
            return new OperationResult<List<SmallNote>>(true, result);
        }

        return new OperationResult<List<SmallNote>>().SetNotFound();
    }
}
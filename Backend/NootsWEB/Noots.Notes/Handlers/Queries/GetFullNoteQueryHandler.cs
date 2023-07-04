using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Encryption.Impl;
using Noots.MapperLocked;
using Noots.Notes.Queries;
using Noots.Permissions.Queries;

namespace Noots.Notes.Handlers.Queries;

public class GetFullNoteQueryHandler : IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly UserNoteEncryptService userNoteEncryptStorage;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly MapperLockedEntities mapperLockedEntities;

    public GetFullNoteQueryHandler(
        IMediator _mediator, 
        NoteRepository noteRepository,
        UserNoteEncryptService userNoteEncryptStorage,
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        MapperLockedEntities mapperLockedEntities)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        this.mapperLockedEntities = mapperLockedEntities;
    }
    
    public async Task<OperationResult<FullNote>> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);
        var isCanRead = permissions.CanRead;

        if (request.FolderId.HasValue && !isCanRead)
        {
            var queryFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
            var permissionsFolder = await mediator.Send(queryFolder);
            isCanRead = permissionsFolder.CanRead;
        }

        if (isCanRead)
        {
            var note = await noteRepository.GetNoteWithLabels(request.NoteId);
            if (note.IsLocked)
            {
                var isUnlocked = userNoteEncryptStorage.IsUnlocked(note.UnlockTime);
                if (!isUnlocked)
                {
                    return new OperationResult<FullNote>(false, null).SetContentLocked();
                }
            }

            if(permissions.Caller != null && !permissions.IsOwner && !permissions.GetAllUsers().Contains(permissions.Caller.Id))
            {
                await usersOnPrivateNotesRepository.AddAsync(new UserOnPrivateNotes { NoteId = note.Id, AccessTypeId = note.RefTypeId, UserId = permissions.Caller.Id });
            }

            if(!permissions.IsOwner)
            {
                note.NoteTypeId = NoteTypeENUM.Shared;
            }

            note.LabelsNotes = note.LabelsNotes.OrderBy(x => x.AddedAt).ToList();
            var ent = mapperLockedEntities.MapNoteToFullNote(note, permissions.CanWrite);
            return new OperationResult<FullNote>(true, ent);
        }

        return new OperationResult<FullNote>(false, null).SetNoPermissions();
    }
}
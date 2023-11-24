using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using MapperLocked;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Notes;
using Notes.Queries;
using Permissions.Impl;
using Permissions.Queries;

namespace Notes.Handlers.Queries;

public class GetFullNoteQueryHandler : IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly MapperLockedEntities mapperLockedEntities;
    private readonly FoldersNotesRepository foldersNotesRepository;

    public GetFullNoteQueryHandler(
        IMediator _mediator,
        NoteRepository noteRepository,
        UsersOnPrivateNotesService usersOnPrivateNotesService,
        MapperLockedEntities mapperLockedEntities,
        FoldersNotesRepository foldersNotesRepository)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
        this.mapperLockedEntities = mapperLockedEntities;
        this.foldersNotesRepository = foldersNotesRepository;
    }
    
    public async Task<OperationResult<FullNote>> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);
        var isCanRead = permissions.CanRead;
        var isFolderPermissions = false;

        if (request.FolderId.HasValue && !isCanRead)
        {
            var isNoteInFolder = await foldersNotesRepository.GetAnyAsync(x => x.FolderId == request.FolderId.Value && x.NoteId == request.NoteId);
            if (isNoteInFolder)
            {
                var queryFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
                var permissionsFolder = await mediator.Send(queryFolder);
                isCanRead = permissionsFolder.CanRead;
                isFolderPermissions = true;
            }
        }

        if (isCanRead)
        {
            var note = await noteRepository.GetNoteWithLabels(request.NoteId);

            if(!isFolderPermissions && permissions.Caller != null && !permissions.IsOwner && !permissions.GetAllUsers().Contains(permissions.Caller.Id))
            {
                await usersOnPrivateNotesService.AddPermissionAsync(note.Id, note.RefTypeId, permissions.Caller.Id);
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
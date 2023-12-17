using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Notes;
using MapperLocked;
using MediatR;
using Notes.Queries;
using Permissions.Queries;
using Permissions.Services;

namespace Notes.Handlers.Queries;

public class GetFullNoteQueryHandler : IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly MapperLockedEntities mapperLockedEntities;
    private readonly FoldersNotesRepository foldersNotesRepository;

    public GetFullNoteQueryHandler(
        IMediator mediator,
        NoteRepository noteRepository,
        UsersOnPrivateNotesService usersOnPrivateNotesService,
        MapperLockedEntities mapperLockedEntities,
        FoldersNotesRepository foldersNotesRepository)
    {
        this.mediator = mediator;
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

        if (!isCanRead)
        {
            return new OperationResult<FullNote>(false, null).SetNoPermissions();
        }
        
        var note = await noteRepository.GetNoteWithLabelsAndUsers(request.NoteId);

        if (note == null)
        {
            return  new OperationResult<FullNote>(false, null!).SetNotFound();
        }

        var userIds = note.UsersOnPrivateNotes.Select(x => x.UserId).ToList();
        userIds.Add(note.UserId);
        
        if(!isFolderPermissions && permissions.CallerId != Guid.Empty && !permissions.IsOwner && !userIds.Contains(permissions.CallerId))
        {
            await usersOnPrivateNotesService.AddPermissionAsync(note.Id, note.RefTypeId, permissions.CallerId);
        }

        if(!permissions.IsOwner)
        {
            note.NoteTypeId = NoteTypeENUM.Shared;
        }

        note.LabelsNotes = note.LabelsNotes.OrderBy(x => x.AddedAt).ToList();
        var ent = mapperLockedEntities.MapNoteToFullNote(note, permissions.CanWrite);
        return new OperationResult<FullNote>(true, ent);
    }
}
﻿using Common;
using Common.DTO;
using Common.DTO.WebSockets;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.History.Impl;
using Noots.Notes.Commands;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace Noots.Notes.Handlers.Commands;

public class ChangeColorNoteCommandHandler : IRequestHandler<ChangeColorNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly NoteWSUpdateService noteWsUpdateService;
    private readonly HistoryCacheService historyCacheService;

    public ChangeColorNoteCommandHandler(
        IMediator _mediator, 
        NoteRepository noteRepository,
        NoteWSUpdateService noteWSUpdateService,
        HistoryCacheService historyCacheService)
    {
        mediator = _mediator;
        this.noteRepository = noteRepository;
        noteWsUpdateService = noteWSUpdateService;
        this.historyCacheService = historyCacheService;
    }
    
    public async Task<OperationResult<Unit>> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var isCanEdit = permissions.All(x => x.perm.CanWrite);
        if (isCanEdit)
        {
            var notesForUpdate = permissions.Select(x => x.perm.Note);
            foreach(var note in notesForUpdate)
            {
                note.Color = request.Color;
                note.UpdatedAt = DateTimeProvider.Time;
            }

            await noteRepository.UpdateRangeAsync(notesForUpdate);

            // HISTORY
            foreach(var perm in permissions)
            {
                await historyCacheService.UpdateNote(perm.noteId, perm.perm.Caller.Id);
            }

            // WS UPDATES
            var updates = permissions
                .Where(x => x.perm.IsMultiplyUpdate)
                .Select(x => ( new UpdateNoteWS { Color = request.Color, NoteId = x.noteId }, x.perm.GetAllUsers()));

            if (updates.Any())
            {
                await noteWsUpdateService.UpdateNotes(updates, request.UserId);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}
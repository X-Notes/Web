﻿using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.WebSockets;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Notes;
using Folders.Commands.FolderInner;
using MediatR;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Folders.Impl
{
    public class FullFolderHandlerCommand :
        IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>,
        IRequestHandler<AddNotesToFolderCommand, OperationResult<Unit>>,
        IRequestHandler<RemoveNotesFromFolderCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateNotesPositionsInFolderCommand, OperationResult<Unit>>
    {
        private readonly FolderRepository folderRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly FolderWSUpdateService folderWSUpdateService;
        private readonly NoteRepository noteRepository;
        private readonly IMediator _mediator;

        public FullFolderHandlerCommand(
            FolderRepository folderRepository,
            IMediator _mediator,
            FoldersNotesRepository foldersNotesRepository,
            FolderWSUpdateService folderWSUpdateService,
            NoteRepository noteRepository)
        {
            this.folderRepository = folderRepository;
            this._mediator = _mediator;
            this.foldersNotesRepository = foldersNotesRepository;
            this.folderWSUpdateService = folderWSUpdateService;
            this.noteRepository = noteRepository;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command, cancellationToken);

            if (!permissions.CanWrite)
            {
                return new OperationResult<Unit>().SetNoPermissions();
            }
            
            async Task UpdateFolderTitle(Folder folder, string title)
            {
                folder.Title = title;
                folder.SetDateAndVersion();
                await folderRepository.UpdateAsync(folder);
            }

            var folder = await folderRepository.GetFolderWithPermissions(request.Id);
                
            if (!folder.IsShared() && folder.UsersOnPrivateFolders.Count == 0)
            {
                await UpdateFolderTitle(folder, request.Title);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            await UpdateFolderTitle(folder, request.Title);

            // WS UPDATES
            var userIds = folder.UsersOnPrivateFolders.Select(x => x.UserId).ToList();
            userIds.Add(folder.UserId);
            var update = new UpdateFolderWS { Title = folder.Title, IsUpdateTitle = true, FolderId = folder.Id };
            await folderWSUpdateService.UpdateFolder(update, userIds, request.ConnectionId);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(AddNotesToFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return new OperationResult<Unit>().SetNoPermissions();
            }

            if (!request.NoteIds.Any())
            {
                return new OperationResult<Unit>().SetAnotherError();
            }

            var commandNotePermissions = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
            var notesPermissions = await _mediator.Send(commandNotePermissions);
            var noteIdsRead = notesPermissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();

            var idsToAdd = await noteRepository.GetNoteIdsNoDeleted(noteIdsRead);

            var foldersNotes = await foldersNotesRepository.GetByFolderId(request.FolderId);
            var foldersNoteIds = foldersNotes.Select(x => x.Id).ToList();

            var newFoldersNotes = idsToAdd.Except(foldersNoteIds)
                                                 .Select((id) => new FoldersNotes() { FolderId = request.FolderId, NoteId = id });

            if (newFoldersNotes.Any())
            {
                var folder = await folderRepository.GetFolderWithPermissions(request.FolderId);
                
                folder.SetDateAndVersion();

                await foldersNotesRepository.AddRangeAsync(newFoldersNotes);
                await folderRepository.UpdateAsync(folder);

                // WS UPDATES
                var titles = await foldersNotesRepository.GetNotesTitle(folder.Id);
                var updates = new UpdateFolderWS { PreviewNotes = titles.Select(title => new NotePreviewInFolder { Title = title }).ToList(), FolderId = folder.Id };
                updates.IdsToAdd.AddRange(idsToAdd);
                
                var userIds = folder.UsersOnPrivateFolders.Select(x => x.UserId).ToList();
                userIds.Add(folder.UserId);
                
                await folderWSUpdateService.UpdateFolder(updates, userIds, request.ConnectionId);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveNotesFromFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return new OperationResult<Unit>().SetNoPermissions();
            }

            if (!request.NoteIds.Any())
            {
                return new OperationResult<Unit>().SetAnotherError();
            }

            var foldersNotesToDelete = await foldersNotesRepository.GetByFolderIdAndNoteIds(request.FolderId, request.NoteIds);

            if (foldersNotesToDelete.Any())
            {
                var folder = await folderRepository.GetFolderWithPermissions(request.FolderId);
                folder.SetDateAndVersion();

                await foldersNotesRepository.RemoveRangeAsync(foldersNotesToDelete);
                await folderRepository.UpdateAsync(folder);

                // WS UPDATES
                var noteIdsToDelete = foldersNotesToDelete.Select(x => x.NoteId);
                var titles = await foldersNotesRepository.GetNotesTitle(folder.Id);
                
                var updates = new UpdateFolderWS { PreviewNotes = titles.Select(title => new NotePreviewInFolder { Title = title }).ToList(), FolderId = folder.Id };
                updates.IdsToRemove.AddRange(noteIdsToDelete);
                
                var userIds = folder.UsersOnPrivateFolders.Select(x => x.UserId).ToList();
                userIds.Add(folder.UserId);
                
                await folderWSUpdateService.UpdateFolder(updates, userIds, request.ConnectionId);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(UpdateNotesPositionsInFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite && request.Positions != null && request.Positions.Any())
            {
                var noteIds = request.Positions.Select(x => x.EntityId).ToList();
                var foldersNotesToUpdateOrder = await foldersNotesRepository.GetByFolderIdAndNoteIds(request.FolderId, noteIds);

                if (foldersNotesToUpdateOrder.Any())
                {
                    var folder = await folderRepository.GetFolderWithPermissions(request.FolderId);
                    folder.SetDateAndVersion();

                    var noteLookUp = foldersNotesToUpdateOrder.ToDictionary(x => x.NoteId);
                    request.Positions.ForEach(x =>
                    {
                        if (noteLookUp.ContainsKey(x.EntityId))
                        {
                            noteLookUp[x.EntityId].Order = x.Position;
                        }
                    });

                    await foldersNotesRepository.UpdateRangeAsync(foldersNotesToUpdateOrder);
                    await folderRepository.UpdateAsync(folder);

                    // WS
                    var updates = new UpdateFolderWS { Positions = request.Positions };
                    var userIds = folder.UsersOnPrivateFolders.Select(x => x.UserId).ToList();
                    userIds.Add(folder.UserId);
                    await folderWSUpdateService.UpdateFolder(updates, userIds, request.ConnectionId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}

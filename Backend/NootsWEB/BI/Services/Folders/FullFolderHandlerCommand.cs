﻿using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.WebSockets;
using Domain.Commands.FolderInner;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Permissions.Queries;
using Noots.RGA_CRDT;
using Noots.SignalrUpdater.Impl;

namespace BI.Services.Folders
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
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.CanWrite)
            {
                async Task UpdateFolderTitle(MergeTransaction<string> transaction)
                {
                    folder.Title.Merge(transaction);
                    folder.UpdatedAt = DateTimeProvider.Time;
                    await folderRepository.UpdateAsync(folder);
                }

                if (permissions.IsSingleUpdate)
                {
                    await UpdateFolderTitle(request.Transaction);
                    return new OperationResult<Unit>(true, Unit.Value);
                }

                await UpdateFolderTitle(request.Transaction);

                // WS UPDATES
                var updateCommand = new UpdateFolderWS { TitleTransaction = request.Transaction, IsUpdateTitle = true, FolderId = folder.Id };
                await folderWSUpdateService.UpdateFolder(updateCommand, permissions.GetAllUsers(), Guid.Empty);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(AddNotesToFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.IsOwner && request.NoteIds.Any())
            {
                var foldersNotes = await foldersNotesRepository.GetByFolderId(request.FolderId);
                var foldersNoteIds = foldersNotes.Select(x => x.Id).ToList();

                var noLockedNotes = await noteRepository.GetWhereAsync(x => request.NoteIds.Contains(x.Id) && x.Password == null);
                var noLockedNoteIds = noLockedNotes.Select(x => x.Id).ToList();

                var newFoldersNotes = noLockedNoteIds.Except(foldersNoteIds)
                                                     .Select((id) => new FoldersNotes() { FolderId = request.FolderId, NoteId = id });

                if (newFoldersNotes.Any())
                {
                    folder.UpdatedAt = DateTimeProvider.Time;

                    await foldersNotesRepository.AddRangeAsync(newFoldersNotes);
                    await folderRepository.UpdateAsync(folder);

                    // WS UPDATES
                    var titles = await foldersNotesRepository.GetNotesTitle(folder.Id);
                    var updates = new UpdateFolderWS { PreviewNotes = titles.Select(title => new NotePreviewInFolder { Title = title }).ToList(), FolderId = folder.Id };
                    updates.IdsToAdd.AddRange(noLockedNoteIds);
                    await folderWSUpdateService.UpdateFolder(updates, permissions.GetAllUsers(), request.UserId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveNotesFromFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.IsOwner && request.NoteIds.Any())
            {
                var foldersNotesToDelete = await foldersNotesRepository.GetByFolderIdAndNoteIds(request.FolderId, request.NoteIds);

                if (foldersNotesToDelete.Any())
                {
                    folder.UpdatedAt = DateTimeProvider.Time;

                    await foldersNotesRepository.RemoveRangeAsync(foldersNotesToDelete);
                    await folderRepository.UpdateAsync(folder);

                    // WS UPDATES
                    var noteIdsToDelete = foldersNotesToDelete.Select(x => x.NoteId);
                    var titles = await foldersNotesRepository.GetNotesTitle(folder.Id);
                    var updates = new UpdateFolderWS { PreviewNotes = titles.Select(title => new NotePreviewInFolder { Title = title }).ToList(), FolderId = folder.Id };
                    updates.IdsToRemove.AddRange(noteIdsToDelete);
                    await folderWSUpdateService.UpdateFolder(updates, permissions.GetAllUsers(), request.UserId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateNotesPositionsInFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.CanWrite && request.Positions != null && request.Positions.Any())
            {
                var noteIds = request.Positions.Select(x => x.EntityId).ToList();
                var foldersNotesToUpdateOrder = await foldersNotesRepository.GetByFolderIdAndNoteIds(request.FolderId, noteIds);

                if (foldersNotesToUpdateOrder.Any())
                {
                    folder.UpdatedAt = DateTimeProvider.Time;

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

                    var updates = new UpdateFolderWS { Positions = request.Positions };
                    await folderWSUpdateService.UpdateFolder(updates, permissions.GetAllUsers(), request.UserId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}

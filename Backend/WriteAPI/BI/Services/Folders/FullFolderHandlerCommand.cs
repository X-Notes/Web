using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.SignalR;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.WebSockets;
using Domain.Commands.FolderInner;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Users;

namespace BI.Services.Folders
{
    public class FullFolderHandlerCommand :
        IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateNotesInFolderCommand, OperationResult<Unit>>
    {
        private readonly FolderRepository folderRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly UserRepository userRepository;
        private readonly FolderWSUpdateService folderWSUpdateService;
        private readonly IMediator _mediator;

        public FullFolderHandlerCommand(
            FolderRepository folderRepository,
            IMediator _mediator,
            FoldersNotesRepository foldersNotesRepository,
            UserRepository userRepository,
            FolderWSUpdateService folderWSUpdateService)
        {
            this.folderRepository = folderRepository;
            this._mediator = _mediator;
            this.foldersNotesRepository = foldersNotesRepository;
            this.userRepository = userRepository;
            this.folderWSUpdateService = folderWSUpdateService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.Id, request.Email);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.CanWrite)
            {
                folder.Title = request.Title;
                folder.UpdatedAt = DateTimeOffset.Now;
                await folderRepository.UpdateAsync(folder);

                // WS UPDATES
                await folderWSUpdateService.UpdateFolder(new UpdateFolderWS { Title = folder.Title, FolderId = folder.Id }, permissions.GetAllUsers());

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(UpdateNotesInFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.CanWrite)
            {
                var foldersNotes = await foldersNotesRepository.GetOrderedByFolderId(request.FolderId);

                var newFoldersNotes = request.NoteIds.Select((id) => new FoldersNotes() { FolderId = request.FolderId, NoteId = id });

                var orders = Enumerable.Range(1, newFoldersNotes.Count());

                newFoldersNotes = newFoldersNotes.Zip(orders, (folderNote, order) =>
                {
                    folderNote.Order = order;
                    return folderNote;
                });

                folder.UpdatedAt = DateTimeOffset.Now;

                await foldersNotesRepository.RemoveRangeAsync(foldersNotes);
                await foldersNotesRepository.AddRangeAsync(newFoldersNotes);
                await folderRepository.UpdateAsync(folder);

                // WS UPDATES
                var titles = await foldersNotesRepository.GetNotesTitle(folder.Id);
                var updates = new UpdateFolderWS { PreviewNotes = titles.Select(title => new NotePreviewInFolder { Title = title }).ToList(), FolderId = folder.Id };
                await folderWSUpdateService.UpdateFolder(updates, permissions.GetAllUsers());

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }
    }
}

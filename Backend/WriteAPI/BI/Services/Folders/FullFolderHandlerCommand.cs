using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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
        private readonly AppSignalRService appSignalRService;
        private readonly UserRepository userRepository;
        private readonly IMediator _mediator;

        public FullFolderHandlerCommand(
            FolderRepository folderRepository,
            IMediator _mediator,
            FoldersNotesRepository foldersNotesRepository,
            AppSignalRService appSignalRService,
            UserRepository userRepository)
        {
            this.folderRepository = folderRepository;
            this._mediator = _mediator;
            this.foldersNotesRepository = foldersNotesRepository;
            this.appSignalRService = appSignalRService;
            this.userRepository = userRepository;
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
                var userIds = new List<Guid>() { folder.UserId };
                userIds.AddRange(folder.UsersOnPrivateFolders.Select(x => x.UserId));
                var users = await userRepository.GetWhereAsync(x => userIds.Contains(x.Id));
                var emails = users.Select(x => x.Email);
                var updates = new UpdateFolderWS { Title = folder.Title, FolderId = folder.Id };
                await appSignalRService.UpdateFoldersInManyUsers(updates, emails);
                //

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
                var notes = await foldersNotesRepository.GetNotes(folder.Id);
                var userIds = new List<Guid>() { folder.UserId };
                userIds.AddRange(folder.UsersOnPrivateFolders.Select(x => x.UserId));
                var users = await userRepository.GetWhereAsync(x => userIds.Contains(x.Id));
                var emails = users.Select(x => x.Email);
                var updates = new UpdateFolderWS { PreviewNotes = notes.Select(x => new NotePreviewInFolder { Title = x.Title }).ToList(), FolderId = folder.Id };
                await appSignalRService.UpdateFoldersInManyUsers(updates, emails);
                //

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }
    }
}

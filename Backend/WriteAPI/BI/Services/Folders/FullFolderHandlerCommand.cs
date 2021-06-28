using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Folders;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.FolderInner;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;

namespace BI.Services.Folders
{
    public class FullFolderHandlerCommand :
        IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateNotesInFolderCommand, OperationResult<Unit>>,
        IRequestHandler<RemoveNotesFromFolderCommand, OperationResult<Unit>>
    {
        private readonly FolderRepository folderRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly IMediator _mediator;
        public FullFolderHandlerCommand(
            FolderRepository folderRepository,
            IMediator _mediator,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.folderRepository = folderRepository;
            this._mediator = _mediator;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.Id, request.Email);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.CanWrite)
            {
                folder.Title = request.Title;
                await folderRepository.Update(folder);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(UpdateNotesInFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
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

                await foldersNotesRepository.RemoveRange(foldersNotes);
                await foldersNotesRepository.AddRange(newFoldersNotes);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveNotesFromFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if (permissions.CanWrite)
            {
                var foldersNotes = await foldersNotesRepository.GetOrderedByFolderId(request.FolderId);
                var notesForDelete = foldersNotes.Where(x => request.NoteIds.Contains(x.NoteId));
                var folderNotesForUpdating = foldersNotes.Except(notesForDelete);

                var orders = Enumerable.Range(1, folderNotesForUpdating.Count());

                folderNotesForUpdating = folderNotesForUpdating
                    .Zip(orders, (folderNote, order) =>
                    {
                        folderNote.Order = order;
                        return folderNote;
                    });

                await foldersNotesRepository.RemoveRange(notesForDelete);
                await foldersNotesRepository.UpdateRange(folderNotesForUpdating);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }
    }
}

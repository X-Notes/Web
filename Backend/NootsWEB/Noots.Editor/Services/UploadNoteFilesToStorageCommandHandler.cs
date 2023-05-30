using Common;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using MediatR;
using Noots.Permissions.Queries;
using Noots.Storage.Commands;
using Noots.DatabaseContext.Repositories.Files;
using Noots.Editor.Commands.Files;

namespace Noots.Editor.Services
{
    public class UploadNoteFilesToStorageCommandHandler :
        IRequestHandler<UploadNoteFilesToStorageCommand, OperationResult<List<AppFile>>>
    {

        private readonly IMediator _mediator;

        private readonly FileRepository fileRepository;

        public UploadNoteFilesToStorageCommandHandler(
            IMediator _mediator,
            FileRepository fileRepository)
        {
            this._mediator = _mediator;
            this.fileRepository = fileRepository;
        }

        public async Task<OperationResult<List<AppFile>>> Handle(UploadNoteFilesToStorageCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                // PERMISSION MEMORY
                var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.Files.Sum(x => x.Length), permissions.Author.Id));
                if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
                {
                    return new OperationResult<List<AppFile>>().SetNoEnougnMemory();
                }

                // FILE LOGIC
                var filebytes = await request.Files.GetFilesBytesAsync();
                List<AppFile> dbFiles = null;
                switch (request.FileType)
                {
                    case FileTypeEnum.Photo:
                        {
                            dbFiles = await _mediator.Send(new SavePhotosToNoteCommand(permissions.Author.Id, filebytes));
                            break;
                        }
                    case FileTypeEnum.Video:
                        {
                            dbFiles = await _mediator.Send(new SaveVideosToNoteCommand(permissions.Author.Id, filebytes));
                            break;
                        }
                    case FileTypeEnum.Document:
                        {
                            dbFiles = await _mediator.Send(new SaveDocumentsToNoteCommand(permissions.Author.Id, filebytes));
                            break;
                        }
                    case FileTypeEnum.Audio:
                        {
                            dbFiles = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.Author.Id, filebytes));
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect file type");
                        }
                }

                async Task removeFilesFromStorage()
                {
                    await _mediator.Send(new RemoveFilesFromStorageCommand(dbFiles, permissions.Author.Id.ToString()));
                }

                if (cancellationToken.IsCancellationRequested)
                {
                    await removeFilesFromStorage();
                    return new OperationResult<List<AppFile>>().SetRequestCancelled();
                }

                try
                {
                    await fileRepository.AddRangeAsync(dbFiles);
                }
                catch (Exception e)
                {
                    await removeFilesFromStorage();
                    return new OperationResult<List<AppFile>>(false, null, OperationResultAdditionalInfo.AnotherError, e.Message);
                }

                return new OperationResult<List<AppFile>>(true, dbFiles);
            }

            return new OperationResult<List<AppFile>>().SetNoPermissions();
        }
    }
}

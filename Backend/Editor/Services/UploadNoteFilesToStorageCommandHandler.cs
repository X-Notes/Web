﻿using Common;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using DatabaseContext.Repositories.Files;
using Editor.Commands.Files;
using MediatR;
using Permissions.Queries;
using Storage.Commands;

namespace Editor.Services
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
            
            if (permissions.CanWrite)
            {
                // PERMISSION MEMORY
                var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.Files.Sum(x => x.Length), permissions.AuthorId));
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
                            dbFiles = await _mediator.Send(new SavePhotosToNoteCommand(permissions.AuthorId, filebytes));
                            break;
                        }
                    case FileTypeEnum.Video:
                        {
                            dbFiles = await _mediator.Send(new SaveVideosToNoteCommand(permissions.AuthorId, filebytes));
                            break;
                        }
                    case FileTypeEnum.Document:
                        {
                            dbFiles = await _mediator.Send(new SaveDocumentsToNoteCommand(permissions.AuthorId, filebytes));
                            break;
                        }
                    case FileTypeEnum.Audio:
                        {
                            dbFiles = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.AuthorId, filebytes));
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect file type");
                        }
                }

                async Task removeFilesFromStorage()
                {
                    await _mediator.Send(new RemoveFilesFromStorageCommand(dbFiles, permissions.AuthorId.ToString()));
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

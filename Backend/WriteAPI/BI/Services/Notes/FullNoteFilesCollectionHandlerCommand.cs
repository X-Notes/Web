using BI.Helpers;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Files;
using Domain.Queries.Permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BI.Services.Notes
{
    public class FullNoteFilesCollectionHandlerCommand : 
        IRequestHandler<UploadNoteFilesToStorageAndSaveCommand, OperationResult<List<AppFile>>>
    {

        private readonly IMediator _mediator;

        public FullNoteFilesCollectionHandlerCommand(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        public async Task<OperationResult<List<AppFile>>> Handle(UploadNoteFilesToStorageAndSaveCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
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
                            dbFiles = await _mediator.Send(new SavePhotosToNoteCommand(permissions.Author.Id, filebytes, note.Id));
                            break;
                        }
                    case FileTypeEnum.Video:
                        {
                            dbFiles = await _mediator.Send(new SaveVideosToNoteCommand(permissions.Author.Id, filebytes, note.Id));
                            break;
                        }
                    case FileTypeEnum.Document:
                        {
                            dbFiles = await _mediator.Send(new SaveDocumentsToNoteCommand(permissions.Author.Id, filebytes, note.Id));
                            break;
                        }
                    case FileTypeEnum.Audio:
                        {
                            dbFiles = await _mediator.Send(new SaveAudiosToNoteCommand(permissions.Author.Id, filebytes, note.Id));
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect file type");
                        }
                }

                if (cancellationToken.IsCancellationRequested)
                {
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesFromStorageCommand(pathes, permissions.Author.Id.ToString()));
                    return new OperationResult<List<AppFile>>().SetRequestCancelled();
                }

                return new OperationResult<List<AppFile>>(true, dbFiles);
            }

            return new OperationResult<List<AppFile>>().SetNoPermissions();
        }
    }
}

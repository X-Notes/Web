using Common;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Domain.Commands.NoteInner.FileContent.Files;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using Noots.Storage.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Noots.DatabaseContext.Repositories.Files;

namespace BI.Services.Notes
{
    public class FullNoteFilesCollectionHandlerCommand : 
        IRequestHandler<UploadNoteFilesToStorageAndSaveCommand, OperationResult<List<AppFile>>>
    {

        private readonly IMediator _mediator;
        private readonly FileRepository fileRepository;
        private readonly NoteFolderLabelMapper noteFolderLabelMapper;

        public FullNoteFilesCollectionHandlerCommand(
            IMediator _mediator, 
            FileRepository fileRepository, 
            NoteFolderLabelMapper noteFolderLabelMapper)
        {
            this._mediator = _mediator;
            this.fileRepository = fileRepository;
            this.noteFolderLabelMapper = noteFolderLabelMapper;
        }

        public async Task<OperationResult<List<AppFile>>> Handle(UploadNoteFilesToStorageAndSaveCommand request, CancellationToken cancellationToken)
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
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesFromStorageCommand(pathes, permissions.Author.Id.ToString()));
                }

                if (cancellationToken.IsCancellationRequested)
                {
                    await removeFilesFromStorage();
                    return new OperationResult<List<AppFile>>().SetRequestCancelled();
                }

                try  
                {
                   await fileRepository.AddRangeAsync(dbFiles);
                } catch (Exception e)
                {
                    await removeFilesFromStorage();
                    return new OperationResult<List<AppFile>>(false, null, OperationResultAdditionalInfo.AnotherError, e.Message);
                }

                dbFiles.ForEach(x => x.SetAuthorPath(noteFolderLabelMapper.BuildFilePath, permissions.Author.Id));

                return new OperationResult<List<AppFile>>(true, dbFiles);
            }

            return new OperationResult<List<AppFile>>().SetNoPermissions();
        }
    }
}

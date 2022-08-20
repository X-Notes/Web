using BI.Services.Notes;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Common.DTO.Files;
using Domain.Commands.NoteInner.FileContent.Files;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.Storage.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.FullNoteAPI;

[Route("api/note/inner/files")]
[ApiController]
public class FullNoteFilesController : ControllerBase
{

    private readonly IMediator _mediator;
    private readonly CollectionLinkedService collectionLinkedService;

    public FullNoteFilesController(IMediator _mediator, CollectionLinkedService collectionLinkedService)
    {
        this._mediator = _mediator;
        this.collectionLinkedService = collectionLinkedService;
    }

    [HttpPost("upload/{noteId}/{fileType}")]
    public async Task<OperationResult<List<FileDTO>>> UploadFiles(List<IFormFile> noteFiles, Guid noteId, FileTypeEnum fileType, CancellationToken cancellationToken)
    {
        if (noteFiles.Count == 0) // TODO MOVE TO FILTER
        {
            return new OperationResult<List<FileDTO>>().SetNoAnyFile();
        }

        IEnumerable<OperationResult<List<Guid>>> results = null;

        switch (fileType)
        {
            case FileTypeEnum.Photo:
            {
                results = noteFiles.Select(photo => this.ValidateFile<List<Guid>>(photo, SupportFileContentTypes.Photos));
                break;
            }
            case FileTypeEnum.Video:
            {
                results = noteFiles.Select(video => this.ValidateFile<List<Guid>>(video, SupportFileContentTypes.Videos));
                break;
            }
            case FileTypeEnum.Document:
            {
                results = noteFiles.Select(document => this.ValidateFile<List<Guid>>(document, SupportFileContentTypes.Documents));
                break;
            }
            case FileTypeEnum.Audio:
            {
                results = noteFiles.Select(audio => this.ValidateFile<List<Guid>>(audio, SupportFileContentTypes.Audios));
                break;
            }
            default:
            {
                throw new Exception("Incorrect file type");
            }
        }

        var result = results.FirstOrDefault(x => !x.Success);
        if (result != null)
        {
            return new OperationResult<List<FileDTO>>().SetNoSupportExtension();
        }

        var command = new UploadNoteFilesToStorageAndSaveCommand(fileType, noteFiles, noteId);
        command.UserId = this.GetUserId();
        var resp = await _mediator.Send(command, cancellationToken);

        if(resp.Success)
        {
            var respResult = resp.Data
                .Select(x => new FileDTO(x.Id, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig, x.PathNonPhotoContent,
                    x.Name, x.UserId, x.MetaData, x.CreatedAt)).ToList();
            return new OperationResult<List<FileDTO>>(true, respResult);
        }

        return new OperationResult<List<FileDTO>>(false, null, resp.Status);
    }

    [HttpPatch("metadata")]
    public async Task<OperationResult<FileDTO>> UpdateFileMetaData(UpdateFileMetaDataCommand command)
    {
        command.UserId = this.GetUserId();
        var rs =  await _mediator.Send(command);
        if (rs.Success && rs.Data.MetaData.ImageFileId.HasValue)
        {
            var list = new List<Guid> { rs.Data.MetaData.ImageFileId.Value };
            await collectionLinkedService.TryLink(list);
        }
        return rs;
    }
}
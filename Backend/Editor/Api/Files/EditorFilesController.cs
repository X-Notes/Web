﻿using Common;
using Common.Azure;
using Common.ConstraintsUploadFiles;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Common.DTO.Files;
using Common.Filters;
using Editor.Commands.Files;
using Editor.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Storage.Commands;

namespace Editor.Api.Files;

[Route("api/editor/files")]
[ApiController]
[Authorize]
public class EditorFilesController : ControllerBase
{

    private readonly IMediator _mediator;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly AzureConfig azureConfig;

    public EditorFilesController(
        IMediator _mediator,
        CollectionLinkedService collectionLinkedService,
        AzureConfig azureConfig)
    {
        this._mediator = _mediator;
        this.collectionLinkedService = collectionLinkedService;
        this.azureConfig = azureConfig;
    }

    [HttpPost("upload/{noteId}/{fileType}")]
    [ValidationRequireUserIdFilter]
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

        var command = new UploadNoteFilesToStorageCommand(fileType, noteFiles, noteId);
        command.UserId = this.GetUserId();
        var resp = await _mediator.Send(command, cancellationToken);

        if (resp.Success)
        {
            var respResult = resp.Data
                .Select(x => new FileDTO(x.Id, azureConfig.FirstOrDefaultCache(x.StorageId).Url, x.PathPrefix, x.PathFileId, x.GetPathFileSuffixes(), 
                    x.Name, x.UserId, x.GetMetadata(), x.CreatedAt)).ToList();
            return new OperationResult<List<FileDTO>>(true, respResult);
        }

        return new OperationResult<List<FileDTO>>(false, null, resp.Status);
    }

    [HttpPatch("metadata")]
    [ValidationRequireUserIdFilter]
    public async Task<OperationResult<FileDTO>> UpdateFileMetaData(UpdateFileMetaDataCommand command)
    {
        command.UserId = this.GetUserId();
        var rs = await _mediator.Send(command);
        if (rs.Success && rs.Data.MetaData.ImageFileId.HasValue)
        {
            var list = new List<Guid> { rs.Data.MetaData.ImageFileId.Value };
            await collectionLinkedService.TryLink(list);
        }
        return rs;
    }
}
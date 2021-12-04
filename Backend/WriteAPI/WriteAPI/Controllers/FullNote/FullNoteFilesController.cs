using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Files;
using Domain.Commands.NoteInner.FileContent.Photos;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers.FullNote
{
    [Route("api/note/inner/files")]
    [ApiController]
    public class FullNoteFilesController : ControllerBase
    {

        private readonly IMediator _mediator;

        public FullNoteFilesController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost("upload/{noteId}/{fileType}")]
        public async Task<OperationResult<List<Guid>>> UploadAudiosToCollection(List<IFormFile> files, Guid noteId, FileTypeEnum fileType, CancellationToken cancellationToken)
        {
            if (files.Count == 0) // TODO MOVE TO FILTER
            {
                return new OperationResult<List<Guid>>().SetNoAnyFile();
            }

            IEnumerable<OperationResult<List<Guid>>> results = null;

            switch (fileType)
            {
                case FileTypeEnum.Photo:
                    {
                        results = files.Select(photo => this.ValidateFile<List<Guid>>(photo, SupportFileContentTypes.Photos));
                        break;
                    }
                case FileTypeEnum.Video:
                    {
                        results = files.Select(video => this.ValidateFile<List<Guid>>(video, SupportFileContentTypes.Videos));
                        break;
                    }
                case FileTypeEnum.Document:
                    {
                        results = files.Select(document => this.ValidateFile<List<Guid>>(document, SupportFileContentTypes.Documents));
                        break;
                    }
                case FileTypeEnum.Audio:
                    {
                        results = files.Select(audio => this.ValidateFile<List<Guid>>(audio, SupportFileContentTypes.Audios));
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
                return new OperationResult<List<Guid>>().SetNoSupportExtension();
            }

            var resp =  await _mediator.Send(new UploadNoteFilesToStorageAndSaveCommand(fileType, files, noteId), cancellationToken);
            return new OperationResult<List<Guid>>(true ,resp.Data.Select(x => x.Id).ToList());
        }
    }
}

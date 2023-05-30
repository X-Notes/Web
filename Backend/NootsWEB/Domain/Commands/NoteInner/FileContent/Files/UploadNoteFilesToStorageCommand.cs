using Common.CQRS;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Files
{
    public class UploadNoteFilesToStorageCommand : BaseCommandEntity, IRequest<OperationResult<List<AppFile>>>
    {
        public FileTypeEnum FileType { set; get; }

        public List<IFormFile> Files { set; get; }

        public Guid NoteId { set; get; }

        public UploadNoteFilesToStorageCommand(FileTypeEnum fileType, List<IFormFile> files, Guid noteId)
        {
            FileType = fileType;
            Files = files;
            NoteId = noteId;
        }
    }
}

using Common.DatabaseModels.Models.Files;
using Common.DTO;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Files
{
    public class UploadNoteFilesToStorageAndSaveCommand : BaseCommandEntity, IRequest<OperationResult<List<AppFile>>>
    {
        public FileTypeEnum FileType { set; get; }

        public List<IFormFile> Files { set; get; }

        public Guid NoteId { set; get; }

        public UploadNoteFilesToStorageAndSaveCommand(FileTypeEnum fileType, List<IFormFile> files, Guid noteId)
        {
            FileType = fileType;
            Files = files;
            NoteId = noteId;
        }
    }
}

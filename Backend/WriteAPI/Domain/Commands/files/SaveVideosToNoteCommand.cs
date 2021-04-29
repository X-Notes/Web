using Common.DatabaseModels.models.Files;
using Common.DTO.files;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.files
{
    public enum SaveVideosType
    {
        FormFile,
        Bytes
    }

    public class SaveVideosToNoteCommand : IRequest<AppFile>
    {
        public IFormFile Video { set; get; }
        public FilesBytes FileBytes { set; get; }

        public SaveVideosType FileType { set; get; }

        public Guid NoteId { set; get; }

        public SaveVideosToNoteCommand(IFormFile Video, Guid NoteId)
        {
            this.Video = Video;
            this.NoteId = NoteId;
            FileType = SaveVideosType.FormFile;
        }

        public SaveVideosToNoteCommand(FilesBytes FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            FileType = SaveVideosType.Bytes;
        }
    }
}

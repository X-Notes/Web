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
        public Guid UserId { set; get; }

        public SaveVideosToNoteCommand(Guid userId, IFormFile Video, Guid NoteId)
        {
            this.Video = Video;
            this.NoteId = NoteId;
            FileType = SaveVideosType.FormFile;
            UserId = userId;
        }

        public SaveVideosToNoteCommand(Guid userId, FilesBytes FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            FileType = SaveVideosType.Bytes;
            UserId = userId;
        }
    }
}

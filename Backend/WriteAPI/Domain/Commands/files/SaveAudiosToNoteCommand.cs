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
    public enum SaveAudiosType
    {
        FormFile,
        Bytes
    }

    public class SaveAudiosToNoteCommand : IRequest<AppFile>
    {
        public IFormFile Audio { set; get; }
        public FilesBytes FileBytes { set; get; }

        public SaveAudiosType FileType { set; get; }


        public Guid NoteId { set; get; }
        public string UserId { set; get; }

        public SaveAudiosToNoteCommand(string userId, IFormFile Audio, Guid NoteId)
        {
            this.Audio = Audio;
            this.NoteId = NoteId;
            this.FileType = SaveAudiosType.FormFile;
            UserId = userId;
        }

        public SaveAudiosToNoteCommand(string userId, FilesBytes FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            this.FileType = SaveAudiosType.Bytes;
            UserId = userId;
        }

    }
}

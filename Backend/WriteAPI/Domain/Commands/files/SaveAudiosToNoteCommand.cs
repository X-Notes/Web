using Common.Attributes;
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

        [RequiredEnumField(ErrorMessage = "FileType is required.")]
        public SaveAudiosType FileType { set; get; }


        public Guid NoteId { set; get; }

        public Guid UserId { set; get; }

        public SaveAudiosToNoteCommand(Guid userId, IFormFile Audio, Guid NoteId)
        {
            this.Audio = Audio;
            this.NoteId = NoteId;
            this.FileType = SaveAudiosType.FormFile;
            UserId = userId;
        }

        public SaveAudiosToNoteCommand(Guid userId, FilesBytes FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            this.FileType = SaveAudiosType.Bytes;
            UserId = userId;
        }

    }
}

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
    public enum SavePhotosType { 
        FormFile,
        Bytes
    }

    public class SavePhotosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<IFormFile> FormFilePhotos { set; get; }
        public List<FilesBytes> FilesBytes { set; get; }


        public SavePhotosType FileType { set; get; }

        public Guid NoteId { set; get; }

        public SavePhotosToNoteCommand(List<IFormFile> Photos, Guid NoteId)
        {
            this.FormFilePhotos = Photos;
            this.NoteId = NoteId;
            FileType = SavePhotosType.FormFile;
        }

        public SavePhotosToNoteCommand(List<FilesBytes> Photos, Guid NoteId)
        {
            this.FilesBytes = Photos;
            this.NoteId = NoteId;
            FileType = SavePhotosType.Bytes;
        }

    }
}

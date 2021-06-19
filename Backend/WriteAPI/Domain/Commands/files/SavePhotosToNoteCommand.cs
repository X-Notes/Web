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
    public class SavePhotosToNoteResponse {
        public AppFile AppFile { set; get; }
        public IFormFile IFormFile { set; get; }
        public FilesBytes FilesBytes { set; get; }
        public SavePhotosType FileType { set; get; }
    }

    public enum SavePhotosType { 
        FormFile,
        Bytes
    }

    public class SavePhotosToNoteCommand : IRequest<List<SavePhotosToNoteResponse>>
    {
        public List<IFormFile> FormFilePhotos { set; get; }
        public List<FilesBytes> FilesBytes { set; get; }


        public SavePhotosType FileType { set; get; }

        public Guid NoteId { set; get; }
        public Guid UserId { set; get; }

        public SavePhotosToNoteCommand(Guid userId, List<IFormFile> Photos, Guid NoteId)
        {
            this.FormFilePhotos = Photos;
            this.NoteId = NoteId;
            FileType = SavePhotosType.FormFile;
            UserId = userId;
        }

        public SavePhotosToNoteCommand(Guid userId, List<FilesBytes> Photos, Guid NoteId)
        {
            this.FilesBytes = Photos;
            this.NoteId = NoteId;
            FileType = SavePhotosType.Bytes;
            UserId = userId;
        }

    }
}

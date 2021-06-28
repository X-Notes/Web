using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Albums
{
    public class UploadPhotosToAlbumCommand : BaseCommandEntity, IRequest<OperationResult<List<AlbumPhotoDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public List<IFormFile> Photos { set; get; }

        public UploadPhotosToAlbumCommand(Guid NoteId, Guid ContentId, List<IFormFile> Photos)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Photos = Photos;
        }
    }
}

using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Domain.Commands.noteInner.fileContent.albums
{
    public class UploadPhotosToAlbumCommand : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
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

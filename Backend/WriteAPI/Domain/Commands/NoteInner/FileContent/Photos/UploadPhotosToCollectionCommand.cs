using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UploadPhotosToCollectionCommand : BaseCommandEntity, IRequest<OperationResult<List<PhotoNoteDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public List<IFormFile> Photos { set; get; }

        public UploadPhotosToCollectionCommand(Guid noteId, Guid contentId, List<IFormFile> photos)
        {
            this.NoteId = noteId;
            this.ContentId = contentId;
            this.Photos = photos;
        }
    }
}

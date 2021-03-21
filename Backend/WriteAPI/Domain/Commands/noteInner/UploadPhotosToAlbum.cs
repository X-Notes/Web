using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.noteInner
{
    public class UploadPhotosToAlbum : BaseCommandEntity, IRequest<OperationResult<List<Guid>>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        public List<IFormFile> Photos { set; get; }
        public UploadPhotosToAlbum(Guid NoteId, Guid ContentId, List<IFormFile> Photos)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Photos = Photos;
        }
    }
}

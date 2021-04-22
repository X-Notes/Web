

using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.videos
{
    public class InsertVideosToNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public List<IFormFile> Videos { set; get; }
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid ContentId { set; get; }
        public InsertVideosToNoteCommand(List<IFormFile> Videos, Guid NoteId, Guid ContentId)
        {
            this.Videos = Videos;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}

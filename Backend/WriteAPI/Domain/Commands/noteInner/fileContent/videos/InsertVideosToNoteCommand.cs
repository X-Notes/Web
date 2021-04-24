

using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.videos
{
    public class InsertVideosToNoteCommand : BaseCommandEntity, IRequest<OperationResult<VideoNoteDTO>>
    {
        [Required]
        public IFormFile Video { set; get; }
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid ContentId { set; get; }
        public InsertVideosToNoteCommand(IFormFile Video, Guid NoteId, Guid ContentId)
        {
            this.Video = Video;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}

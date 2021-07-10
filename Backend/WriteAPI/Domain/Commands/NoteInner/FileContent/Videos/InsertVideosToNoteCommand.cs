using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Videos
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

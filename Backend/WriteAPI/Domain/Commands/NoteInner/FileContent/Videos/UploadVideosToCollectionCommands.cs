using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class UploadVideosToCollectionCommands : BaseCommandEntity, IRequest<OperationResult<List<VideoNoteDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public List<IFormFile> Videos { set; get; }

        public UploadVideosToCollectionCommands(Guid NoteId, Guid ContentId, List<IFormFile> videos)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Videos = videos;
        }
    }
}

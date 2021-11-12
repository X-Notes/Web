using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class UpdateVideosContentsCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [RequiredListNotEmptyAttribute]
        public List<VideosCollectionNoteDTO> Videos { set; get; } = new List<VideosCollectionNoteDTO>();
    }
}

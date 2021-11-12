using Common.Attributes;
using Common.DTO;
using MediatR;
using System;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class RemoveVideoFromCollectionCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public Guid VideoId { set; get; } // TODO DO MANY and for other files

        public RemoveVideoFromCollectionCommand(Guid noteId, Guid contentId, Guid videoId)
        {
            NoteId = noteId;
            ContentId = contentId;
            VideoId = videoId;
        }
    }
}

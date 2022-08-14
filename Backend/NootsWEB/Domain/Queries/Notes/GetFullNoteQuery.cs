using System;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetFullNoteQuery: BaseQueryEntity, IRequest<OperationResult<FullNote>>
    {
        public Guid NoteId { set; get; }

        public Guid? FolderId { set; get; }

        public GetFullNoteQuery(Guid userId, Guid noteId, Guid? folderId)
            :base(userId)
        {
            this.NoteId = noteId;
            this.FolderId = folderId;
        }
    }
}

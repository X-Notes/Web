using System;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetFullNoteQuery: BaseQueryEntity, IRequest<FullNoteAnswer>
    {
        public Guid NoteId { set; get; }

        public Guid? FolderId { set; get; }

        public GetFullNoteQuery(string email, Guid noteId, Guid? folderId)
            :base(email)
        {
            this.NoteId = noteId;
            this.FolderId = folderId;
        }
    }
}

using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Notes.Queries
{
    public class GetNotesByNoteIdsQuery : BaseQueryEntity, IRequest<OperationResult<List<SmallNote>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> NoteIds { set; get; }

        public int TakeContents { set; get; }

        public GetNotesByNoteIdsQuery(Guid userId, List<Guid> noteIds, int takeContents)
            : base(userId)
        {
            NoteIds = noteIds;
            TakeContents = takeContents;
        }
    }
}

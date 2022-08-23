using Common.Attributes;
using Common.CQRS;
using Common.DTO.Notes.AdditionalContent;
using MediatR;

namespace Noots.Notes.Queries
{
    public class GetAdditionalContentNoteInfoQuery : BaseQueryEntity, IRequest<List<BottomNoteContent>>
    {
        [RequiredListNotEmpty]
        public List<Guid> NoteIds { set; get; }

        public GetAdditionalContentNoteInfoQuery(List<Guid> noteIds)
        {
            NoteIds = noteIds;
        }
    }
}

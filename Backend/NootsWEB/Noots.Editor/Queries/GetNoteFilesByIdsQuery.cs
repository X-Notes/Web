using Common.Attributes;
using Common.CQRS;
using Common.DTO.Notes.FullNoteContent.Files;
using MediatR;

namespace Editor.Queries
{
    public class GetNoteFilesByIdsQuery<T> : BaseQueryEntity, IRequest<List<T>> where T : BaseFileNoteDTO
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid CollectionId { set; get; }

        [RequiredListNotEmpty]
        public List<Guid> FileIds { set; get; }
    }
}

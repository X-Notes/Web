using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Noots.Editor.Queries
{
    public class GetNoteContentsQuery : BaseQueryEntity, IRequest<OperationResult<List<BaseNoteContentDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        public Guid? FolderId { set; get; }

        public GetNoteContentsQuery(Guid userId, Guid noteId, Guid? folderId = null)
            : base(userId)
        {
            NoteId = noteId;
            FolderId = folderId;
        }
    }
}

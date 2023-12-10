using Common.CQRS;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Folders.Queries
{
    public class GetFolderNotesByFolderIdQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {

        public Guid FolderId { set; get; }

        public int TakeContents { set; get; }

        public List<Guid>? NoteIds { set; get; }

        public GetFolderNotesByFolderIdQuery(Guid folderId, Guid userId, List<Guid> noteIds, int takeContents)
        {
            FolderId = folderId;
            UserId = userId;
            NoteIds = noteIds;
            TakeContents = takeContents;
        }
    }
}

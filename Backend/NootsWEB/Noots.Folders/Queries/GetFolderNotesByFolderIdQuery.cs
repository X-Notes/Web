using Common.CQRS;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Noots.Folders.Queries
{
    public class GetFolderNotesByFolderIdQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {

        public Guid FolderId { set; get; }

        public PersonalizationSettingDTO Settings { set; get; }

        public List<Guid> NoteIds { set; get; }

        public GetFolderNotesByFolderIdQuery(Guid folderId, Guid userId, PersonalizationSettingDTO settings, List<Guid> noteIds)
        {
            FolderId = folderId;
            UserId = userId;
            Settings = settings;
            NoteIds = noteIds;
        }
    }
}

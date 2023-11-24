using Common.CQRS;
using MediatR;
using Permissions.Entities;

namespace Permissions.Queries
{
    public class GetUserPermissionsForNotesManyQuery : BaseQueryEntity, IRequest<List<(Guid noteId, UserPermissionsForNote perm)>>
    {
        public List<Guid> NoteIds { set; get; }

        public GetUserPermissionsForNotesManyQuery(List<Guid> noteIds, Guid userId)
        {
            NoteIds = noteIds;
            this.UserId = userId;
        }
    }
}

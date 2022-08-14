using Common.CQRS;
using MediatR;
using Noots.Permissions.Entities;

namespace Noots.Permissions.Queries
{
    public class GetUserPermissionsForNoteQuery : BaseQueryEntity, IRequest<UserPermissionsForNote>
    {
        public Guid NoteId { set; get; }

        public GetUserPermissionsForNoteQuery(Guid noteId, Guid userId)
        {
            NoteId = noteId;
            UserId = userId;
        }
    }
}

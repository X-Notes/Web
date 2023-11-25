using Common.CQRS;
using MediatR;
using Permissions.Entities;

namespace Permissions.Queries
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

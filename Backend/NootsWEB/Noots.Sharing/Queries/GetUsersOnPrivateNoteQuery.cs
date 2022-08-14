using Common.CQRS;
using Common.DTO.Users;
using MediatR;

namespace Noots.Sharing.Queries
{
    public class GetUsersOnPrivateNoteQuery : BaseQueryEntity, IRequest<List<InvitedUsersToFoldersOrNote>>
    {
        public Guid NoteId { set; get; }
    }
}

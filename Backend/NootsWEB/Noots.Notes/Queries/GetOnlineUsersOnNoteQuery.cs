using Common.CQRS;
using Common.DTO.Users;
using MediatR;

namespace Noots.Notes.Queries
{
    public class GetOnlineUsersOnNoteQuery: BaseQueryEntity, IRequest<List<OnlineUserOnNote>>
    {
        public Guid Id { set; get; }
        public GetOnlineUsersOnNoteQuery(Guid id)
        {
            this.Id = id;
        }
    }
}

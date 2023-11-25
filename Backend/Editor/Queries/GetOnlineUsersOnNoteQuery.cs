using Common.CQRS;
using Common.DTO.Users;
using MediatR;

namespace Editor.Queries
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

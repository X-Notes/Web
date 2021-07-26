using System;
using System.Collections.Generic;
using Common.DTO.Users;
using MediatR;

namespace Domain.Queries.Notes
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

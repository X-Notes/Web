using Common.DTO.users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetOnlineUsersOnNote: IRequest<List<OnlineUserOnNote>>
    {
        public Guid Id { set; get; }
        public GetOnlineUsersOnNote(Guid id)
        {
            this.Id = id;
        }
    }
}

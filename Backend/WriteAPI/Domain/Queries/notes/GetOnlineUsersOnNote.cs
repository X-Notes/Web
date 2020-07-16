using Common.DTO.users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetOnlineUsersOnNote: IRequest<List<OnlineUserOnNote>>
    {
        public string Id { set; get; }
        public GetOnlineUsersOnNote(string id)
        {
            this.Id = id;
        }
    }
}

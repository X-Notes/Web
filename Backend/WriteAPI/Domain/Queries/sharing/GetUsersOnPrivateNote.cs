using Common.DTO.users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.sharing
{
    public class GetUsersOnPrivateNote : BaseQueryEntity, IRequest<List<InvitedUsersToFoldersOrNote>>
    {
        public Guid NoteId { set; get; }
    }
}

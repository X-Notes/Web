using System;
using System.Collections.Generic;
using Common.CQRS;
using Common.DTO.Users;
using MediatR;

namespace Domain.Queries.Sharing
{
    public class GetUsersOnPrivateNoteQuery : BaseQueryEntity, IRequest<List<InvitedUsersToFoldersOrNote>>
    {
        public Guid NoteId { set; get; }
    }
}

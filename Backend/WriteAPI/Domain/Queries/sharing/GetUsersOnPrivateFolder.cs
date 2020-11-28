using Common.DTO.users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.sharing
{
    public class GetUsersOnPrivateFolder : BaseQueryEntity, IRequest<List<InvitedUsersToFoldersOrNote>>
    {
        public Guid FolderId { set; get; }
    }
}

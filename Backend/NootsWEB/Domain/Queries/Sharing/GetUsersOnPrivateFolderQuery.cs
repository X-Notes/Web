using System;
using System.Collections.Generic;
using Common.DTO.Users;
using MediatR;

namespace Domain.Queries.Sharing
{
    public class GetUsersOnPrivateFolderQuery : BaseQueryEntity, IRequest<List<InvitedUsersToFoldersOrNote>>
    {
        public Guid FolderId { set; get; }
    }
}

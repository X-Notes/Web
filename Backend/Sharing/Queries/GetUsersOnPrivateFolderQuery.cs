﻿using Common.CQRS;
using Common.DTO.Users;
using MediatR;

namespace Sharing.Queries
{
    public class GetUsersOnPrivateFolderQuery : BaseQueryEntity, IRequest<List<InvitedUsersToFoldersOrNote>>
    {
        public Guid FolderId { set; get; }
    }
}

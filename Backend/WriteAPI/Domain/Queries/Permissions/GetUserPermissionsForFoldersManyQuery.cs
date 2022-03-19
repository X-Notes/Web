using Common.DTO.Permissions;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForFoldersManyQuery : BaseQueryEntity, IRequest<List<(Guid folderId, UserPermissionsForFolder perm)>>
    {
        public List<Guid> FolderIds { set; get; }

        public GetUserPermissionsForFoldersManyQuery(List<Guid> folderIds, Guid userId)
        {
            this.FolderIds = folderIds;
            this.UserId = userId;
        }
    }
}

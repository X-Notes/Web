using Common.DTO.Permissions;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForFoldersManyQuery : BaseQueryEntity, IRequest<List<(Guid noteId, UserPermissionsForFolder perm)>>
    {
        public List<Guid> FolderIds { set; get; }

        public GetUserPermissionsForFoldersManyQuery(List<Guid> folderIds, string email)
        {
            this.FolderIds = folderIds;
            this.Email = email;
        }
    }
}

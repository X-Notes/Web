using Common.CQRS;
using MediatR;
using Permissions.Entities;

namespace Permissions.Queries
{
    public class GetUserPermissionsForFoldersManyQuery : BaseQueryEntity, IRequest<List<(Guid folderId, UserPermissionsForFolder perm)>>
    {
        public List<Guid> FolderIds { set; get; }

        public GetUserPermissionsForFoldersManyQuery(List<Guid> folderIds, Guid userId)
        {
            FolderIds = folderIds;
            UserId = userId;
        }
    }
}

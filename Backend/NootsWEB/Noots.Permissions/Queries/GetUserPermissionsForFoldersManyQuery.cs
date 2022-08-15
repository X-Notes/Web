using Common.CQRS;
using MediatR;
using Noots.Permissions.Entities;

namespace Noots.Permissions.Queries
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

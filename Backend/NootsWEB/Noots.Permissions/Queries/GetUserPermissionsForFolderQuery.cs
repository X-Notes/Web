using Common.CQRS;
using MediatR;
using Permissions.Entities;

namespace Permissions.Queries
{
    public class GetUserPermissionsForFolderQuery : BaseQueryEntity, IRequest<UserPermissionsForFolder>
    {
        public Guid FolderId { set; get; }

        public GetUserPermissionsForFolderQuery(Guid FolderId, Guid userId)
        {
            this.FolderId = FolderId;
            UserId = userId;
        }
    }
}

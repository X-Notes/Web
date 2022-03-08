using System;
using Common.DTO.Permissions;
using MediatR;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForFolderQuery : BaseQueryEntity, IRequest<UserPermissionsForFolder>
    {
        public Guid FolderId { set; get; }

        public GetUserPermissionsForFolderQuery(Guid FolderId, Guid userId)
        {
            this.FolderId = FolderId;
            this.UserId = userId;
        }
    }
}

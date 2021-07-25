using System;
using Common.DTO.Permissions;
using MediatR;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForFolderQuery : BaseQueryEntity, IRequest<UserPermissionsForFolder>
    {
        public Guid FolderId { set; get; }

        public GetUserPermissionsForFolderQuery(Guid FolderId, string Email)
        {
            this.FolderId = FolderId;
            this.Email = Email;
        }
    }
}

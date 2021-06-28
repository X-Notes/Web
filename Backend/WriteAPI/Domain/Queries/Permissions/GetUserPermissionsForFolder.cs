using System;
using Common.DTO.Permissions;
using MediatR;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForFolder : BaseQueryEntity, IRequest<UserPermissionsForFolder>
    {
        public Guid FolderId { set; get; }

        public GetUserPermissionsForFolder(Guid FolderId, string Email)
        {
            this.FolderId = FolderId;
            this.Email = Email;
        }
    }
}

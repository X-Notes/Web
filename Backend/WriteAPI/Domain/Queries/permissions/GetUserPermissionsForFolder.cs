using Common.DTO.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.permissions
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

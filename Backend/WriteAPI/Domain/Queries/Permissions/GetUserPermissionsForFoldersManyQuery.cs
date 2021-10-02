using Common.DTO.Permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForFoldersManyQuery : BaseQueryEntity, IRequest<List<(Guid, UserPermissionsForFolder)>>
    {
        public List<Guid> FolderIds { set; get; }

        public GetUserPermissionsForFoldersManyQuery(List<Guid> folderIds, string email)
        {
            this.FolderIds = folderIds;
            this.Email = email;
        }
    }
}

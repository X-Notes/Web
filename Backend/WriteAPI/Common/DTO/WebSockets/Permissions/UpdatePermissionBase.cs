using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets.Permissions
{
    public class UpdatePermissionBase
    {
        public List<Guid> RevokeIds { set; get; } = new();

        public List<Guid> IdsToAdd { set; get; } = new();

        public List<UpdatePermissionEntity> UpdatePermissions { set; get; } = new();

        public void UpdatePermission(UpdatePermissionEntity updatePermissionEntity)
        {
            UpdatePermissions.Add(updatePermissionEntity);
        }
    }
}

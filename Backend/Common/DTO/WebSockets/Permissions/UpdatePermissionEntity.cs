using Common.DatabaseModels.Models.Systems;
using System;

namespace Common.DTO.WebSockets.Permissions
{
    public class UpdatePermissionEntity
    {
        public Guid EntityId { set; get; }

        public RefTypeENUM RefTypeId { set; get; }

        public UpdatePermissionEntity(Guid entityId, RefTypeENUM refTypeId)
        {
            EntityId = entityId;
            RefTypeId = refTypeId;
        }
    }
}

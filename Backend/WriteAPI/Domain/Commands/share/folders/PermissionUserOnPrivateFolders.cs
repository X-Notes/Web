using Common.Attributes;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Systems;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.share.folders
{
    public class PermissionUserOnPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid FolderId { set; get; }
        [ValidationGuidAttribute]
        public Guid UserId { set; get; }

        public RefTypeENUM AccessTypeId { set; get; }
    }
}

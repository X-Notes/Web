using Common.Attributes;
using Common.DatabaseModels.models;
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
        [ValidationGuidAttribute]
        public Guid AccessTypeId { set; get; }
    }
}

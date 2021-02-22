using Common.DatabaseModels.models;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.share.folders
{
    public class PermissionUserOnPrivateFolders : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid FolderId { set; get; }
        [Required]
        public Guid UserId { set; get; }
        [Required]
        public Guid AccessTypeId { set; get; }
    }
}

﻿using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Notes.Commands
{
    public class ChangeColorNoteCommand : BaseCommandEntity, IRequest<OperationResult<List<VersionUpdateResult>>>
    {
        [Required]
        public string Color { set; get; }

        [RequiredListNotEmpty]
        public List<Guid> Ids { set; get; }

        public string ConnectionId { set; get; }

        public ChangeColorNoteCommand(List<Guid> ids, Guid userId, string color, string connectionId)
            : base(userId)
        {
            this.Ids = ids;
            Color = color;
            ConnectionId = connectionId;
        }
    }
}

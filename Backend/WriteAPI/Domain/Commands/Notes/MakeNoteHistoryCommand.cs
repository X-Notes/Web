using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.Notes
{
    public class MakeNoteHistoryCommand : IRequest<Unit>
    {
        [Required]
        public Guid Id { set; get; }

        [Required]
        public List<Guid> UserIds { set; get; }

        public MakeNoteHistoryCommand(Guid id, List<Guid> userIds)
        {
            this.Id = id;
            this.UserIds = userIds;
        }
    }
}

using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.Notes
{
    public class MakeNoteHistoryCommand : IRequest<Unit>
    {
        [Required]
        public Guid Id { set; get; }

        public MakeNoteHistoryCommand(Guid id)
        {
            this.Id = id;
        }
    }
}

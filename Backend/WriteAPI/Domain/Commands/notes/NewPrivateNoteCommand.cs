using Common.DTO.notes;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.notes
{
    public class NewPrivateNoteCommand: BaseCommandEntity, IRequest<SmallNote>
    {
        [Required]
        public Guid TypeId { set; get; }
        public NewPrivateNoteCommand(string email)
            :base(email)
        {

        }
    }
}

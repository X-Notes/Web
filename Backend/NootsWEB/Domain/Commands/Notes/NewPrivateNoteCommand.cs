using Common.CQRS;
using Common.DTO.Notes;
using MediatR;
using System;

namespace Domain.Commands.Notes
{
    public class NewPrivateNoteCommand: BaseCommandEntity, IRequest<SmallNote>
    {
        public NewPrivateNoteCommand(Guid userId)
            :base(userId)
        {

        }
    }
}

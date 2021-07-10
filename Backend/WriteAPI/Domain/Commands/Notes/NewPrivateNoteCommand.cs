using Common.DTO.Notes;
using MediatR;

namespace Domain.Commands.Notes
{
    public class NewPrivateNoteCommand: BaseCommandEntity, IRequest<SmallNote>
    {
        public NewPrivateNoteCommand(string email)
            :base(email)
        {

        }
    }
}

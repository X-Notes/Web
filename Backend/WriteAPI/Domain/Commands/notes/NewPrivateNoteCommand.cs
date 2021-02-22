using Common.DTO.notes;
using MediatR;

namespace Domain.Commands.notes
{
    public class NewPrivateNoteCommand: BaseCommandEntity, IRequest<SmallNote>
    {
        public NewPrivateNoteCommand(string email)
            :base(email)
        {

        }
    }
}

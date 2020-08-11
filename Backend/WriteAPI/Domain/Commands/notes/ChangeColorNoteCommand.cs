using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class ChangeColorNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Color { set; get; }
        public List<string> Ids { set; get; }
        public ChangeColorNoteCommand(List<string> ids, string email, string color)
            :base(email)
        {
            this.Ids = ids;
            Color = color;
        }
    }
}

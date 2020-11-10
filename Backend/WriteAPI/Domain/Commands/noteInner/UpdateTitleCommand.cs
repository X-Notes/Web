using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.noteInner
{
    public class UpdateTitleCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Title { set; get; }
        public string Id { set; get; }
    }
}

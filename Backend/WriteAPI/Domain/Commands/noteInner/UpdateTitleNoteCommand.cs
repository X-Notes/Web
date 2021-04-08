using Common.Attributes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.noteInner
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Title { set; get; }
        [ValidationGuidAttribute]
        public Guid Id { set; get; }
    }
}

using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.noteInner
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Title { set; get; }
        [Required]
        public string Id { set; get; }
    }
}

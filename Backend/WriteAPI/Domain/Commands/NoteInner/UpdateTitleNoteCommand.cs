using System;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.NoteInner
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Title { set; get; }
        [ValidationGuid]
        public Guid Id { set; get; }
    }
}

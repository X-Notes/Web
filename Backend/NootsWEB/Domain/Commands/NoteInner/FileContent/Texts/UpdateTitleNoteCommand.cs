using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Texts
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public string Title { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}

using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Texts
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public List<List<object>> Diffs { set; get; }

        public string Title { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}

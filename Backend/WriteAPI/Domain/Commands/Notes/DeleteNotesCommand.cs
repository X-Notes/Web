using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Notes
{
    public class DeleteNotesCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public DeleteNotesCommand(string email): base(email)
        {

        }
    }
}

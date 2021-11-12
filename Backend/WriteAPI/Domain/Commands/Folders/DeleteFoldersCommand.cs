using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Folders
{
    public class DeleteFoldersCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public DeleteFoldersCommand(string email): base(email)
        {

        }
    }
}

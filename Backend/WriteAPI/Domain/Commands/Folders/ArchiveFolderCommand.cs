using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Folders
{
    public class ArchiveFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public ArchiveFolderCommand(string email) : base(email)
        {

        }
    }
}

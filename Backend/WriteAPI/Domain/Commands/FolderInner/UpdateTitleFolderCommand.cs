using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.FolderInner
{
    public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        public string Title { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }
    }
}

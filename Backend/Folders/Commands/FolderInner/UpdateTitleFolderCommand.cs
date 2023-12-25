using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Folders.Commands.FolderInner;

public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
{
    [MaxLength(500)]
    public string Title { set; get; }

    [ValidationGuid]
    public Guid Id { set; get; }

    public string ConnectionId { set; get; }
}
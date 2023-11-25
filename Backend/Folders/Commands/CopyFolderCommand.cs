using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DTO;
using Folders.Entities;
using MediatR;

namespace Folders.Commands;

public class CopyFolderCommand : BaseCommandEntity, IRequest<OperationResult<CopyFoldersResult>>
{
    [MaxLength(1), MinLength(1)]
    public List<Guid> Ids { set; get; }

    public CopyFolderCommand(Guid userId) : base(userId)
    {

    }
}

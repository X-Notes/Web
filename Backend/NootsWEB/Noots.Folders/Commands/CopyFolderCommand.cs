using Common.CQRS;
using Common.DTO;
using MediatR;
using Noots.Folders.Entities;
using System.ComponentModel.DataAnnotations;

namespace Noots.Folders.Commands;

public class CopyFolderCommand : BaseCommandEntity, IRequest<OperationResult<CopyFoldersResult>>
{
    [MaxLength(1), MinLength(1)]
    public List<Guid> Ids { set; get; }

    public CopyFolderCommand(Guid userId) : base(userId)
    {

    }
}

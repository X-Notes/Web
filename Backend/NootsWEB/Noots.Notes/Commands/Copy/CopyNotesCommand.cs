using Common.CQRS;
using Common.DTO;
using MediatR;
using System.ComponentModel.DataAnnotations;

namespace Noots.Notes.Commands.Copy
{
    public class CopyNotesCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [MaxLength(1), MinLength(1)]
        public List<Guid> Ids { set; get; }

        public Guid? FolderId { set; get; }

        public CopyNotesCommand(Guid userId) : base(userId)
        {

        }
    }
}

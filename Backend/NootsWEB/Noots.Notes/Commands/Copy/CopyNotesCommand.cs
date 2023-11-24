using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Notes.Commands.Copy
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

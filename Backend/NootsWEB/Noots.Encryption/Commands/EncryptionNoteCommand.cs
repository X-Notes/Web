using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Noots.Encryption.Commands
{
    public class EncryptionNoteCommand : BaseCommandEntity, IRequest<OperationResult<bool>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        public string Password { set; get; }

        public string ConfirmPassword { set; get; }
    }
}

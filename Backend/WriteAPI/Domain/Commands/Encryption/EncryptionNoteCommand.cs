using System;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.Encryption
{
    public class EncryptionNoteCommand : BaseCommandEntity, IRequest<OperationResult<bool>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        public string Password { set; get; }
        public string ConfirmPassword { set; get; }
    }
}

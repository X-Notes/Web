using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.encryption
{
    public class EncryptionNoteCommand : BaseCommandEntity, IRequest<OperationResult<bool>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        public string Password { set; get; }
        public string ConfirmPassword { set; get; }
    }
}

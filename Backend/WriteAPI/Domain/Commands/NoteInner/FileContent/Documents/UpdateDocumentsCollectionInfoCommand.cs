using Common.Attributes;
using Common.DTO;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UpdateDocumentsCollectionInfoCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [Required]
        public string Name { set; get; }
    }
}

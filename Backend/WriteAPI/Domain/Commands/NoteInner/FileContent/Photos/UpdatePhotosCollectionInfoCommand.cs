using Common.Attributes;
using Common.DTO;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UpdatePhotosCollectionInfoCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [Required]
        public string Name { set; get; }

        [Range(1, 4)]
        public int Count { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string Width { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string Height { set; get; }
    }
}

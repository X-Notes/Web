using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class ChangePhotosCollectionSizeCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string Width { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string Height { set; get; }
    }
}

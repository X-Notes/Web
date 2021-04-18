using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.folderInner
{
    public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public string Title { set; get; }
        [ValidationGuidAttribute]
        public Guid Id { set; get; }
    }
}

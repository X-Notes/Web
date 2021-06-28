using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.FolderInner
{
    public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public string Title { set; get; }
        [ValidationGuid]
        public Guid Id { set; get; }
    }
}

using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.folderInner
{
    public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Title { set; get; }
        [Required]
        public Guid Id { set; get; }
    }
}

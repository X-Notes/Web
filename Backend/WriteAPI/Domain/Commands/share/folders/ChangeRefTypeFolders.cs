using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class ChangeRefTypeFolders : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid Id { get; set; }
        [Required]
        public RefType RefType { set; get; }
    }
}

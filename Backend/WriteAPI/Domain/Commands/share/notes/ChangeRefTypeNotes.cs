using Common.DatabaseModels.models;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.notes
{
    public class ChangeRefTypeNotes : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public Guid RefTypeId { set; get; }
    }
}

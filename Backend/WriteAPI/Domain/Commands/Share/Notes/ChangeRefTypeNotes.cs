using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Share.Notes
{
    public class ChangeRefTypeNotes : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<Guid> Ids { get; set; }

        [RequiredEnumField(ErrorMessage = "Ref type id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

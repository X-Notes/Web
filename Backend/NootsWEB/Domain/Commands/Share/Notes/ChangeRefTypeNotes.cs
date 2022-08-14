using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Share.Notes
{
    public class ChangeRefTypeNotes : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { get; set; }

        [RequiredEnumField(ErrorMessage = "Ref type id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

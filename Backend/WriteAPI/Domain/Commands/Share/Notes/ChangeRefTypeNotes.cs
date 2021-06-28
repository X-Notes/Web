using System;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Share.Notes
{
    public class ChangeRefTypeNotes : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { get; set; }

        [RequiredEnumField(ErrorMessage = "Ref type id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

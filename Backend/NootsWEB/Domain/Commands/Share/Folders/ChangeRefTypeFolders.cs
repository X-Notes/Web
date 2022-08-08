using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class ChangeRefTypeFolders : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { get; set; }

        [RequiredEnumField(ErrorMessage = "RefType id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

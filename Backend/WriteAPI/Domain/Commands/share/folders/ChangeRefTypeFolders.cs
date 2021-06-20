using Common.Attributes;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Systems;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class ChangeRefTypeFolders : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid Id { get; set; }

        [RequiredEnumField(ErrorMessage = "RefType id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

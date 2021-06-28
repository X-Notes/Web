using System;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Share.Folders
{
    public class ChangeRefTypeFolders : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { get; set; }

        [RequiredEnumField(ErrorMessage = "RefType id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

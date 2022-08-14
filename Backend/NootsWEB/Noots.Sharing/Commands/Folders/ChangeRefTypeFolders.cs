using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using MediatR;

namespace Noots.Sharing.Commands.Folders
{
    public class ChangeRefTypeFolders : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmpty]
        public List<Guid> Ids { get; set; }

        [RequiredEnumField(ErrorMessage = "RefType id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

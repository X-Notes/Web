using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Noots.Sharing.Commands.Folders
{
    public class SendInvitesToUsersFolders : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmpty]
        public List<Guid> UserIds { set; get; }

        [ValidationGuid]
        public Guid FolderId { set; get; }

        [RequiredEnumField(ErrorMessage = "Ref type id is required.")]
        public RefTypeENUM RefTypeId { set; get; }
    }
}

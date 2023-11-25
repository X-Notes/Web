using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.Personalization;
using MediatR;

namespace Folders.Queries
{
    public class GetFoldersByFolderIdsQuery : BaseQueryEntity, IRequest<OperationResult<List<SmallFolder>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> FolderIds { set; get; }

        [Required]
        public PersonalizationSettingDTO Settings { set; get; }

        public GetFoldersByFolderIdsQuery(Guid userId, List<Guid> folderIds, PersonalizationSettingDTO settings)
            : base(userId)
        {
            this.Settings = settings;
            this.FolderIds = folderIds;
        }
    }
}

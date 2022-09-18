using Common.Attributes;
using Common.CQRS;
using Common.DTO.Folders.AdditionalContent;
using MediatR;

namespace Noots.Folders.Queries
{
    public class GetAdditionalContentFolderInfoQuery : BaseQueryEntity, IRequest<List<BottomFolderContent>>
    {
        [RequiredListNotEmpty]
        public List<Guid> FolderIds { set; get; }

        public GetAdditionalContentFolderInfoQuery(List<Guid> folderIds)
        {
            FolderIds = folderIds;
        }
    }
}

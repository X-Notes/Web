using Common.DTO.Notes.AdditionalContent;
using MediatR;
using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO.Folders.AdditionalContent;

namespace Domain.Queries.Folders
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

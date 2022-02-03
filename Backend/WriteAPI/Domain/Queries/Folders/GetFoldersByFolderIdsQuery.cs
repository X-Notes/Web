using Common.Attributes;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.Personalization;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Queries.Folders
{
    public class GetFoldersByFolderIdsQuery : BaseQueryEntity, IRequest<OperationResult<List<SmallFolder>>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> FolderIds { set; get; }

        [Required]
        public PersonalizationSettingDTO Settings { set; get; }

        public GetFoldersByFolderIdsQuery(string email, List<Guid> folderIds, PersonalizationSettingDTO settings)
            : base(email)
        {
            this.Settings = settings;
            this.FolderIds = folderIds;
        }
    }
}

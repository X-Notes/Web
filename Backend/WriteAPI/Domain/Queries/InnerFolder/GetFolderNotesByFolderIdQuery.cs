using System;
using System.Collections.Generic;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Domain.Queries.InnerFolder
{
    public class GetFolderNotesByFolderIdQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {

        public Guid FolderId { set; get; }

        public PersonalizationSettingDTO Settings { set; get; }

        public GetFolderNotesByFolderIdQuery(Guid folderId, string email, PersonalizationSettingDTO settings)
        {
            this.FolderId = folderId;
            this.Email = email;
            this.Settings = settings;
        }
    }
}

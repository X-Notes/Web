using System;
using System.Collections.Generic;
using Common.CQRS;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Domain.Queries.InnerFolder
{
    public class GetFolderNotesByFolderIdQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {

        public Guid FolderId { set; get; }

        public PersonalizationSettingDTO Settings { set; get; }

        public List<Guid> NoteIds { set; get; }

        public GetFolderNotesByFolderIdQuery(Guid folderId, Guid userId, PersonalizationSettingDTO settings, List<Guid> noteIds)
        {
            this.FolderId = folderId;
            this.UserId = userId;
            this.Settings = settings;
            NoteIds = noteIds;  
        }
    }
}

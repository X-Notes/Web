using System;
using System.Collections.Generic;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.InnerFolder
{
    public class GetPreviewSelectedNotesForFolderQuery : BaseQueryEntity, IRequest<List<PreviewNoteForSelection>>
    {
        public Guid FolderId { set; get; }
        public string Search { set; get; }
        public GetPreviewSelectedNotesForFolderQuery(string Email, Guid FolderId, string Search)
        {
            this.Email = Email;
            this.FolderId = FolderId;
            this.Search = Search;
        }
    }
}

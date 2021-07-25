using System;
using System.Collections.Generic;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.InnerFolder
{
    public class GetFolderNotesByFolderIdQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public Guid FolderId { set; get; }
        public GetFolderNotesByFolderIdQuery(Guid FolderId, string Email)
        {
            this.FolderId = FolderId;
            this.Email = Email;
        }
    }
}

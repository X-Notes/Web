using System;
using System.Collections.Generic;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.InnerFolder
{
    public class GetFolderNotesByFolderId : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        public Guid FolderId { set; get; }
        public GetFolderNotesByFolderId(Guid FolderId, string Email)
        {
            this.FolderId = FolderId;
            this.Email = Email;
        }
    }
}

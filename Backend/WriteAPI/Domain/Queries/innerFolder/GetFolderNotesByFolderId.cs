using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.innerFolder
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

using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.innerFolder
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

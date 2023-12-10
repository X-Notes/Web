using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Search.Queries
{
    public class GetPreviewSelectedNotesForFolderQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [ValidationGuid]
        public Guid FolderId { set; get; }

        public string Search { set; get; }

        public int TakeContents { set; get; }
    }
}

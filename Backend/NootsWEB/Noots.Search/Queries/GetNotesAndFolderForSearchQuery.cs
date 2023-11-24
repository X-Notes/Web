using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using MediatR;
using Search.Entities;

namespace Search.Queries
{
    public class GetNotesAndFolderForSearchQuery : BaseQueryEntity, IRequest<SearchNoteFolderResult>
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string SearchString { set; get; }
    }
}

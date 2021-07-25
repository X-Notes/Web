using System.ComponentModel.DataAnnotations;
using Common.DTO.Search;
using MediatR;

namespace Domain.Queries.Search
{
    public class GetNotesAndFolderForSearchQuery : BaseQueryEntity, IRequest<SearchNoteFolderResult>
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string SearchString { set; get; }
    }
}

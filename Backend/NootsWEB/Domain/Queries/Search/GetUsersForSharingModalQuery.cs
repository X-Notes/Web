using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DTO.Search;
using MediatR;

namespace Domain.Queries.Search
{
    public class GetUsersForSharingModalQuery: BaseQueryEntity, IRequest<List<ShortUserForShareModal>>
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string SearchString { set; get; }
    }
}

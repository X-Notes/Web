using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using MediatR;
using Noots.Search.Entities;

namespace Noots.Search.Queries
{
    public class GetUsersForSharingModalQuery : BaseQueryEntity, IRequest<List<ShortUserForShareModal>>
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string SearchString { set; get; }
    }
}

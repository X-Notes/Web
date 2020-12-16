using Common.DTO.search;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Queries.search
{
    public class GetUsersForSharingModalQuery: BaseQueryEntity, IRequest<List<ShortUserForShareModal>>
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string SearchString { set; get; }
    }
}

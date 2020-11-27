using Common.DTO.search;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.search
{
    public class GetUsersForSharingModalQuery: BaseQueryEntity, IRequest<List<ShortUserForShareModal>>
    {
        public string SearchString { set; get; }
    }
}

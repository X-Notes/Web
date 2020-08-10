using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.folders
{
    public class GetPrivateFoldersQuery : BaseQueryEntity, IRequest<List<SmallFolder>>
    {
        public GetPrivateFoldersQuery(string email):base(email)
        {

        }
    }
}

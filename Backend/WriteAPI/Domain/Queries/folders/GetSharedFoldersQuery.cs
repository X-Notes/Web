using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.folders
{
    public class GetSharedFoldersQuery : BaseQueryEntity, IRequest<List<SmallFolder>>
    {
        public GetSharedFoldersQuery(string email):base(email)
        {

        }
    }
}

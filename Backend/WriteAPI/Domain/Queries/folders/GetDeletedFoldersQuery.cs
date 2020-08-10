using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.folders
{
    public class GetDeletedFoldersQuery : BaseQueryEntity, IRequest<List<SmallFolder>>
    {
        public GetDeletedFoldersQuery(string email):base(email)
        {

        }
    }
}

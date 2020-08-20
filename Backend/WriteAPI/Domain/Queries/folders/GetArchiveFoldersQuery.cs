using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.folders
{
    public class GetArchiveFoldersQuery : BaseQueryEntity, IRequest<List<SmallFolder>>
    {
        public GetArchiveFoldersQuery(string email): base(email)
        {

        }
    }
}

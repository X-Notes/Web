using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.users
{
    public class GetUserMemoryResponse
    {
        public long TotalSize { set; get; }
    }

    public class GetUserMemory : BaseQueryEntity, IRequest<GetUserMemoryResponse>
    {
        public GetUserMemory(string Email) :base(Email)
        {
        }
    }
}

using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.folders
{
    public class GetFullFolderQuery : BaseQueryEntity, IRequest<FullFolderAnswer>
    {
        public Guid Id { set; get; }
        public GetFullFolderQuery(string email, Guid id)
            : base(email)
        {
            this.Id = id;
        }
    }
}

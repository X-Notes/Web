using System;
using Common.DTO.Folders;
using MediatR;

namespace Domain.Queries.Folders
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

using System;
using Common.DTO.Folders;
using MediatR;

namespace Domain.Queries.Folders
{
    public class GetFullFolderQuery : BaseQueryEntity, IRequest<FullFolderAnswer>
    {
        public Guid Id { set; get; }
        public GetFullFolderQuery(Guid userId, Guid id)
            : base(userId)
        {
            this.Id = id;
        }
    }
}

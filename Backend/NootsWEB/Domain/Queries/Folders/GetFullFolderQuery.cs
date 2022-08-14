using System;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Folders;
using MediatR;

namespace Domain.Queries.Folders
{
    public class GetFullFolderQuery : BaseQueryEntity, IRequest<OperationResult<FullFolder>>
    {
        public Guid Id { set; get; }

        public GetFullFolderQuery(Guid userId, Guid id)
            : base(userId)
        {
            this.Id = id;
        }
    }
}

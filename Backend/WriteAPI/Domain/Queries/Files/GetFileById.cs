using System;
using Common.DTO.Files;
using MediatR;

namespace Domain.Queries.Files
{
    public class GetFileById : BaseQueryEntity, IRequest<FilesBytes>
    {
        public Guid Id { set; get; }
        public string UserId { set; get; }
        public GetFileById(Guid Id, string userId)
        {
            this.Id = Id;
            UserId = userId;
        }
    }
}

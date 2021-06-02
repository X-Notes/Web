using Common.DTO.files;
using MediatR;
using System;

namespace Domain.Queries.files
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

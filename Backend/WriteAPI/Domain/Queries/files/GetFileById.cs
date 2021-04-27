using Common.DTO.files;
using MediatR;
using System;

namespace Domain.Queries.files
{
    public class GetFileById : BaseQueryEntity, IRequest<FilesBytes>
    {
        public Guid Id { set; get; }
        public GetFileById(Guid Id)
        {
            this.Id = Id;
        }
    }
}

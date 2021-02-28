using Common.DTO.files;
using MediatR;
using System;

namespace Domain.Queries.files
{
    public class GetPhotoById : BaseQueryEntity, IRequest<FilesBytes>
    {
        public Guid Id { set; get; }
        public GetPhotoById(Guid Id)
        {
            this.Id = Id;
        }
    }
}

using Common.DTO.files;
using MediatR;
using System;

namespace Domain.Queries.files
{
    public class GetBytesUserPhotoById : BaseQueryEntity, IRequest<FilesBytes>
    {
        public Guid Id { set; get; }
        public GetBytesUserPhotoById(Guid Id)
        {
            this.Id = Id;
        }
    }
}

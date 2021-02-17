using Common.DTO.files;
using MediatR;
using System;

namespace Domain.Queries.files
{
    public class GetBytesPhotoById : BaseQueryEntity, IRequest<FilesBytes>
    {
        public Guid Id { set; get; }
        public GetBytesPhotoById(Guid Id)
        {
            this.Id = Id;
        }
    }
}

using Common.DTO.files;
using Domain.Queries.files;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.files
{
    public class FilesHandlerQuery :
        IRequestHandler<GetPhotoById, FilesBytes>
    {
        private readonly FileRepository fileRepository;
        public FilesHandlerQuery(FileRepository fileRepository)
        {
            this.fileRepository = fileRepository;
        }
        public async Task<FilesBytes> Handle(GetPhotoById request, CancellationToken cancellationToken)
        {
            var file = await fileRepository.FirstOrDefault(x => x.Id == request.Id);
            if (file != null)
            {
                var bytes = System.IO.File.ReadAllBytes(file.Path);
                return new FilesBytes(bytes, file.Type);
            }
            return null;
        }
    }
}

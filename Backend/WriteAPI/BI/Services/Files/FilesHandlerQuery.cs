using System;
using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Files;
using Domain.Queries.Files;
using MediatR;
using Storage;
using WriteContext.Repositories;

namespace BI.Services.Files
{
    public class FilesHandlerQuery :
        IRequestHandler<GetFileById, FilesBytes>
    {
        private readonly FileRepository fileRepository;
        private readonly IFilesStorage filesStorage;
        public FilesHandlerQuery(FileRepository fileRepository, IFilesStorage filesStorage)
        {
            this.fileRepository = fileRepository;
            this.filesStorage = filesStorage;
        }

        public async Task<FilesBytes> Handle(GetFileById request, CancellationToken cancellationToken)
        {
            var file = await fileRepository.FirstOrDefaultAsync(x => x.Id == request.Id);
            if (file != null)
            {
                var resp = await filesStorage.GetFile(request.UserId, file.PathNonPhotoContent);
                return new FilesBytes(resp.File, resp.ContentType, file.Name);
            }
            throw new Exception("File does not exist");
        }
    }
}

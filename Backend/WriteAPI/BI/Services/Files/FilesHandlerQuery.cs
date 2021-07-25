using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Files;
using Domain.Queries.Files;
using MediatR;
using Storage;

namespace BI.Services.Files
{
    public class FilesHandlerQuery :
        IRequestHandler<GetFileByPathQuery, FilesBytes>
    {
        private readonly IFilesStorage filesStorage;
        public FilesHandlerQuery(IFilesStorage filesStorage)
        { 
            this.filesStorage = filesStorage;
        }

        public async Task<FilesBytes> Handle(GetFileByPathQuery request, CancellationToken cancellationToken)
        {
            var resp = await filesStorage.GetFile(request.UserId, request.Path);
            return new FilesBytes(resp.File, resp.ContentType, request.FileName);
        }
    }
}

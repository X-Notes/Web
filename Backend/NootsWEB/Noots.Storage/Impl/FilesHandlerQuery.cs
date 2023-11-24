using Common.DTO.Files;
using MediatR;
using Noots.DatabaseContext.Repositories.Users;
using Storage.Interfaces;
using Storage.Queries;

namespace Storage.Impl
{
    public class FilesHandlerQuery :
        IRequestHandler<GetFileByPathQuery, FilesBytes>,
        IRequestHandler<GetUserStorageMemoryQuery, GetUserMemoryResponse>
    {
        private readonly IFilesStorage filesStorage;
        private readonly UserRepository userRepository;
        public FilesHandlerQuery(IFilesStorage filesStorage, UserRepository userRepository)
        {
            this.filesStorage = filesStorage;
            this.userRepository = userRepository;
        }

        public async Task<FilesBytes> Handle(GetFileByPathQuery request, CancellationToken cancellationToken)
        {
            var resp = await filesStorage.GetFile(request.StorageId, request.UserId.ToString(), request.Path);
            return new FilesBytes(resp.File, resp.ContentType, request.FileName);
        }

        public async Task<GetUserMemoryResponse> Handle(GetUserStorageMemoryQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            var size = await filesStorage.GetUsedDiskSpace(user.StorageId, user.Id.ToString());
            return new GetUserMemoryResponse { TotalSize = size };
        }
    }
}

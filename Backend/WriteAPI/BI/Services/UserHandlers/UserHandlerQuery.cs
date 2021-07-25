using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Common.DTO.Users;
using Domain.Queries.Users;
using MediatR;
using Storage;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
{
    public class UserHandlerQuery :
        IRequestHandler<GetShortUserQuery, ShortUser>,
        IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>
    {
        private readonly UserRepository userRepository;
        private readonly IMapper imapper;
        private readonly IFilesStorage fileStorage;
        public UserHandlerQuery(UserRepository userRepository, IMapper imapper, IFilesStorage fileStorage)
        {
            this.userRepository = userRepository;
            this.imapper = imapper;
            this.fileStorage = fileStorage;
        }

        public async Task<ShortUser> Handle(GetShortUserQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludeBackgroundAndPhoto(request.Email);
            if (user != null)
            {
                return imapper.Map<ShortUser>(user);
            }
            return null;
        }

        public async Task<GetUserMemoryResponse> Handle(GetUserMemoryQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludeBackgroundAndPhoto(request.Email);
            var totalSize = await fileStorage.GetUsedDiskSpace(user.Id.ToString());
            return new GetUserMemoryResponse { TotalSize = totalSize };
        }
    }
}

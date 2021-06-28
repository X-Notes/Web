using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Common.DTO.Users;
using Domain.Queries.Users;
using MediatR;
using Storage;
using WriteContext.Repositories.Users;

namespace BI.Services.user
{
    public class UserHandlerQuery :
        IRequestHandler<GetShortUser, ShortUser>,
        IRequestHandler<GetUserMemory, GetUserMemoryResponse>
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

        public async Task<ShortUser> Handle(GetShortUser request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailWithPersonalization(request.Email);
            if(user != null)
            {
                return imapper.Map<ShortUser>(user);
            }
            return null;
        }

        public async Task<GetUserMemoryResponse> Handle(GetUserMemory request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailWithPersonalization(request.Email);
            var totalSize = await fileStorage.GetUsedDiskSpace(user.Id.ToString());
            return new GetUserMemoryResponse { TotalSize = totalSize }; 
        }
    }
}

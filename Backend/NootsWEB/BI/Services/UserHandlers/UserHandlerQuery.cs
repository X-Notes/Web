using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Common.DTO.Users;
using Domain.Queries.Users;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Storage.Queries;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
{
    public class UserHandlerQuery :
        IRequestHandler<GetShortUserQuery, OperationResult<ShortUser>>,
        IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>
    {
        private readonly UserRepository userRepository;

        private readonly FileRepository fileRepository;
        private readonly UserBackgroundMapper userBackgroundMapper;

        public UserHandlerQuery(
            UserRepository userRepository, 
            FileRepository fileRepository,
            UserBackgroundMapper userBackgroundMapper)
        {
            this.userRepository = userRepository;
            this.fileRepository = fileRepository;
            this.userBackgroundMapper = userBackgroundMapper;
        }

        public async Task<OperationResult<ShortUser>> Handle(GetShortUserQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludeBackgroundAndPhoto(request.UserId);
            if (user != null)
            {
                var userDto = userBackgroundMapper.MapToShortUser(user);
                return new OperationResult<ShortUser>(true , userDto);
            }
            return new OperationResult<ShortUser>().SetNotFound();
        }

        public async Task<GetUserMemoryResponse> Handle(GetUserMemoryQuery request, CancellationToken cancellationToken)
        {
            var size = await fileRepository.GetTotalUserMemory(request.UserId);
            return new GetUserMemoryResponse { TotalSize = size };
        }
    }
}

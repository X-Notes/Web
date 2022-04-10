using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DTO;
using Common.DTO.Users;
using Domain.Queries.Files;
using Domain.Queries.Users;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
{
    public class UserHandlerQuery :
        IRequestHandler<GetUserQuery, OperationResult<UserDTO>>,
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

        public async Task<OperationResult<UserDTO>> Handle(GetUserQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludeBackgroundAndPhoto(request.UserId);
            if (user != null)
            {
                var userDto = userBackgroundMapper.MapToUser(user);
                return new OperationResult<UserDTO>(true , userDto);
            }
            return new OperationResult<UserDTO>().SetNotFound();
        }

        public async Task<GetUserMemoryResponse> Handle(GetUserMemoryQuery request, CancellationToken cancellationToken)
        {
            var size = await fileRepository.GetTotalUserMemory(request.UserId);
            return new GetUserMemoryResponse { TotalSize = size };
        }
    }
}

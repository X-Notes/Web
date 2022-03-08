using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Common.DTO;
using Common.DTO.Users;
using Domain.Queries.Files;
using Domain.Queries.Users;
using MediatR;
using Storage;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
{
    public class UserHandlerQuery :
        IRequestHandler<GetShortUserQuery, OperationResult<ShortUser>>,
        IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>
    {
        private readonly UserRepository userRepository;

        private readonly IMapper imapper;

        private readonly FileRepository fileRepository;

        public UserHandlerQuery(UserRepository userRepository, IMapper imapper, FileRepository fileRepository)
        {
            this.userRepository = userRepository;
            this.imapper = imapper;
            this.fileRepository = fileRepository;
        }

        public async Task<OperationResult<ShortUser>> Handle(GetShortUserQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludeBackgroundAndPhoto(request.UserId);
            if (user != null)
            {
                var userDto = imapper.Map<ShortUser>(user);
                return new OperationResult<ShortUser>(true ,userDto);
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

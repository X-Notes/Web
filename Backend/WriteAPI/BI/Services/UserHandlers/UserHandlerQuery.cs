using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Common.DTO.Users;
using Domain.Queries.Files;
using Domain.Queries.Users;
using MediatR;
using Storage;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
{
    public class UserHandlerQuery :
        IRequestHandler<GetShortUserQuery, ShortUser>,
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
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            var size = await fileRepository.GetTotalUserMemory(user.Id);
            return new GetUserMemoryResponse { TotalSize = size };
        }
    }
}

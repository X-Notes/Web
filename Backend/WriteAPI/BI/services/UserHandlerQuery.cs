using AutoMapper;
using Common.DTO;
using Domain.Queries.users;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services
{
    public class UserHandlerQuery :
        IRequestHandler<GetShortUser, ShortUser>
    {
        private readonly UserRepository userRepository;
        private readonly IMapper imapper;
        public UserHandlerQuery(UserRepository userRepository, IMapper imapper)
        {
            this.userRepository = userRepository;
            this.imapper = imapper;
        }

        public async Task<ShortUser> Handle(GetShortUser request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);          
            return imapper.Map<ShortUser>(user);
        }
    }
}

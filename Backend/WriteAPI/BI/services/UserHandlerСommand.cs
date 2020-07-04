using AutoMapper;
using Common;
using Domain.Commands;
using MediatR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.models;
using WriteContext.Repositories;

namespace BI.services
{
    public class UserHandlerСommand : 
        IRequestHandler<NewUser, Unit>,
        IRequestHandler<UpdateMainUserInfo, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly IMapper imapper;
        public UserHandlerСommand(UserRepository userRepository, IMapper imapper)
        {
            this.userRepository = userRepository;
            this.imapper = imapper;
        }

        public async Task<Unit> Handle(NewUser request, CancellationToken cancellationToken)
        {
            var user = imapper.Map<User>(request);
            await userRepository.Add(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateMainUserInfo request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.Name = request.Name;
            await userRepository.Update(user);
            return Unit.Value;
        }
    }
}

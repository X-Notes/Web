using AutoMapper;
using BI.helpers;
using Common;
using Domain.Commands.users;
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
        IRequestHandler<UpdateMainUserInfo, Unit>,
        IRequestHandler<UpdatePhoto, Unit>,
        IRequestHandler<UpdateLanguage, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly IMapper imapper;
        private readonly PhotoHelpers photoHelpers;
        public UserHandlerСommand(UserRepository userRepository, IMapper imapper, PhotoHelpers photoHelpers)
        {
            this.userRepository = userRepository;
            this.imapper = imapper;
            this.photoHelpers = photoHelpers;
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

        public async Task<Unit> Handle(UpdatePhoto request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.PhotoId = await photoHelpers.GetBase64(request.File);
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateLanguage request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.Language = request.Language;
            await userRepository.Update(user);
            return Unit.Value;
        }
    }
}

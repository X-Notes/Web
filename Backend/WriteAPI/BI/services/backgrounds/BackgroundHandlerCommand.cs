using AutoMapper;
using BI.helpers;
using Common.DatabaseModels.models;
using Common.DTO.backgrounds;
using Domain.Commands.backgrounds;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.backgrounds
{
    public class BackgroundHandlerCommand :
        IRequestHandler<DefaultBackgroundCommand, Unit>,
        IRequestHandler<RemoveBackgroundCommand, Unit>,
        IRequestHandler<UpdateBackgroundCommand, Unit>,
        IRequestHandler<NewBackgroundCommand, BackgroundDTO>
    {
        private readonly IMapper mapper;
        private readonly UserRepository userRepository;
        private readonly BackgroundRepository backgroundRepository;
        private readonly PhotoHelpers photoHelpers;
        public BackgroundHandlerCommand(BackgroundRepository backgroundRepository,
                                        UserRepository userRepository,
                                        PhotoHelpers photoHelpers,
                                        IMapper mapper)
        {
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
            this.photoHelpers = photoHelpers;
            this.mapper = mapper;
        }

        public async Task<Unit> Handle(DefaultBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.CurrentBackgroundId = null;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.Email);
            var back = user.Backgrounds.Where(x => x.Id == request.Id).FirstOrDefault();
            if (back != null)
            {
                await backgroundRepository.DeleteBackground(back);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.CurrentBackgroundId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<BackgroundDTO> Handle(NewBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            var item = new Backgrounds()
            {
                Path = await photoHelpers.GetBase64(request.File),
                UserId = user.Id
            };
            await backgroundRepository.Add(item);
            await Handle(new UpdateBackgroundCommand(request.Email, item.Id), CancellationToken.None);
            return mapper.Map<BackgroundDTO>(item);
        }
    }
}

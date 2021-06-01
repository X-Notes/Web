using AutoMapper;
using BI.helpers;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.Users;
using Common.DTO.backgrounds;
using Domain.Commands.backgrounds;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Users;

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
        private readonly IFilesStorage filesStorage;
        public BackgroundHandlerCommand(BackgroundRepository backgroundRepository,
                                        UserRepository userRepository,
                                        PhotoHelpers photoHelpers,
                                        IMapper mapper,
                                        IFilesStorage filesStorage)
        {
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
            this.photoHelpers = photoHelpers;
            this.mapper = mapper;
            this.filesStorage = filesStorage;
        }

        public async Task<Unit> Handle(DefaultBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.CurrentBackgroundId = null;
            await userRepository.Update(user);
            return Unit.Value;
        }

        // TODO REMOVE FILES FROM STORAGE
        public async Task<Unit> Handle(RemoveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.Email);
            var back = user.Backgrounds.Where(x => x.Id == request.Id).FirstOrDefault();
            if (back != null)
            {
                await backgroundRepository.Remove(back);
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.CurrentBackgroundId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<BackgroundDTO> Handle(NewBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);

            var photoType = photoHelpers.GetPhotoType(request.File.ContentType);
            var pathToCreatedFile = await filesStorage.SaveUserFile(request.File, user.Id, ContentTypesFile.Images, photoType);
            var file = new AppFile { Path = pathToCreatedFile, Type = request.File.ContentType };

            var item = new Backgrounds()
            {
                UserId = user.Id,
                File = file
            };

            var success = await backgroundRepository.AddBackground(item, file);

            if (!success)
            {
                await filesStorage.RemoveUserFile(pathToCreatedFile);
                return null;
            }

            await Handle(new UpdateBackgroundCommand(request.Email, item.Id), CancellationToken.None);
            return mapper.Map<BackgroundDTO>(item);
        }
    }
}

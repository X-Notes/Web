using AutoMapper;
using BI.helpers;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.Users;
using Common.DTO.backgrounds;
using ContentProcessing;
using Domain.Commands.backgrounds;
using Domain.Commands.files;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
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
        private readonly IImageProcessor imageProcessor;
        private readonly IMediator _mediator;
        private readonly FileRepository fileRepository;
        public BackgroundHandlerCommand(BackgroundRepository backgroundRepository,
                                        UserRepository userRepository,
                                        PhotoHelpers photoHelpers,
                                        IMapper mapper,
                                        IFilesStorage filesStorage,
                                        IImageProcessor imageProcessor,
                                        IMediator _mediator,
                                        FileRepository fileRepository)
        {
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
            this.photoHelpers = photoHelpers;
            this.mapper = mapper;
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
            this._mediator = _mediator;
            this.fileRepository = fileRepository;
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
                var pathes = back.File.GetNotNullPathes();
                await _mediator.Send(new RemoveFilesByPathesCommand(user.Id.ToString(), pathes));
                await backgroundRepository.Remove(back);
                await fileRepository.RemoveById(back.FileId);
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

            var ms = new MemoryStream();
            await request.File.CopyToAsync(ms);
            ms.Position = 0;

            var bigType = CopyType.Big;
            var mediumType = CopyType.Medium;
            var thumbs = await imageProcessor.ProcessCopies(ms, bigType, mediumType);

            AppFile appFile;

            if(thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[bigType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[mediumType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(null, mediumFile, bigFile, request.File.ContentType, thumbs[bigType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, user.Id);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[mediumType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(null, mediumFile, defaultFile, request.File.ContentType, thumbs[CopyType.Default].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, user.Id);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(defaultFile, null, null, request.File.ContentType, thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, user.Id);
            }


            var item = new Backgrounds()
            {
                UserId = user.Id,
                File = appFile
            };

            var success = await backgroundRepository.AddBackground(item, appFile);

            if (!success)
            {
                await _mediator.Send(new RemoveFilesByPathesCommand(user.Id.ToString(), appFile.GetNotNullPathes()));
                return null;
            }

            await Handle(new UpdateBackgroundCommand(request.Email, item.Id), CancellationToken.None);
            return mapper.Map<BackgroundDTO>(item);
        }
    }
}

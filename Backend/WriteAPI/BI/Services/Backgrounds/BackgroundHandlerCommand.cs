using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using BI.Helpers;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Backgrounds;
using ContentProcessing;
using Domain.Commands.Backgrounds;
using Domain.Commands.Files;
using MediatR;
using Storage;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.Services.Backgrounds
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
        private readonly IFilesStorage filesStorage;
        private readonly IImageProcessor imageProcessor;
        private readonly IMediator _mediator;
        private readonly FileRepository fileRepository;
        public BackgroundHandlerCommand(BackgroundRepository backgroundRepository,
                                        UserRepository userRepository,
                                        IMapper mapper,
                                        IFilesStorage filesStorage,
                                        IImageProcessor imageProcessor,
                                        IMediator _mediator,
                                        FileRepository fileRepository)
        {
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
            this.mapper = mapper;
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
            this._mediator = _mediator;
            this.fileRepository = fileRepository;
        }

        public async Task<Unit> Handle(DefaultBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
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
                await backgroundRepository.Remove(back);
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), back.File).SetIsNoCheckDelete());
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.CurrentBackgroundId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<BackgroundDTO> Handle(NewBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var photoType = FileHelper.GetExtension(request.File.FileName);

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

                appFile = new AppFile(null, mediumFile, bigFile, request.File.ContentType, 
                    thumbs[bigType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, user.Id, request.File.FileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[mediumType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(null, mediumFile, defaultFile, request.File.ContentType, 
                    thumbs[CopyType.Default].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, user.Id, request.File.FileName);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(defaultFile, null, null, request.File.ContentType, 
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, user.Id, request.File.FileName);
            }


            var item = new Common.DatabaseModels.Models.Users.Backgrounds()
            {
                UserId = user.Id,
                File = appFile
            };

            var success = await backgroundRepository.AddBackground(item, appFile);

            if (!success)
            {
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), appFile));
                return null;
            }

            await Handle(new UpdateBackgroundCommand(request.Email, item.Id), CancellationToken.None);
            return mapper.Map<BackgroundDTO>(item);
        }
    }
}

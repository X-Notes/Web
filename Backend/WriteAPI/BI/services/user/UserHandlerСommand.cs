using BI.helpers;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.Users;
using Common.DTO.users;
using Common.Naming;
using ContentProcessing;
using Domain.Commands.files;
using Domain.Commands.users;
using MediatR;
using Storage;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.services.user
{
    public class UserHandlerСommand :
        IRequestHandler<NewUserCommand, Unit>,
        IRequestHandler<UpdateMainUserInfoCommand, Unit>,
        IRequestHandler<UpdatePhotoCommand, AnswerChangeUserPhoto>,
        IRequestHandler<UpdateLanguageCommand, Unit>,
        IRequestHandler<UpdateThemeCommand, Unit>,
        IRequestHandler<UpdateFontSizeCommand, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly FileRepository fileRepository;

        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;
        private readonly AppRepository appRepository;
        private readonly IImageProcessor imageProcessor;
        private readonly UserProfilePhotoRepository userProfilePhotoRepository;
        private readonly IMediator _mediator;
        public UserHandlerСommand(
            UserRepository userRepository, 
            PhotoHelpers photoHelpers, 
            IFilesStorage filesStorage,
            FileRepository fileRepository,
            AppRepository appRepository,
            IImageProcessor imageProcessor,
            UserProfilePhotoRepository userProfilePhotoRepository,
            IMediator _mediator)
        {
            this.userRepository = userRepository;
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
            this.fileRepository = fileRepository;
            this.appRepository = appRepository;
            this.imageProcessor = imageProcessor;
            this.userProfilePhotoRepository = userProfilePhotoRepository;
            this._mediator = _mediator;
        }

        public async Task<Unit> Handle(NewUserCommand request, CancellationToken cancellationToken)
        {
            // TODO OPTIMIZATION
            var language = await appRepository.GetLanguageByName(ModelsNaming.English);
            var fontSize = await appRepository.GetFontSizeByName(ModelsNaming.Big);
            var theme = await appRepository.GetThemeByName(ModelsNaming.DarkTheme);
            var billing = await appRepository.GetBillingPlanByName(ModelsNaming.Billing_Basic);

            var user = new User() {
                Name = request.Name,
                LanguageId = language.Id,
                Email = request.Email,
                FontSizeId = fontSize.Id,
                ThemeId = theme.Id,
                BillingPlanId = billing.Id
            };

            await userRepository.Add(user);

            await filesStorage.CreateUserContainer(user.Id);

            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateMainUserInfoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.Name = request.Name;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<AnswerChangeUserPhoto> Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            var userProfilePhoto = await userProfilePhotoRepository.GetWithFile(user.Id);

            if (userProfilePhoto != null)
            {
                var pathes = userProfilePhoto.AppFile.GetNotNullPathes();
                await _mediator.Send(new RemoveFilesByPathesCommand(user.Id.ToString(), pathes));
                await userProfilePhotoRepository.Remove(userProfilePhoto);
                await fileRepository.RemoveById(userProfilePhoto.AppFileId);
            }

            var photoType = photoHelpers.GetPhotoType(request.File.ContentType);

            using var ms = new MemoryStream();
            await request.File.CopyToAsync(ms);
            ms.Position = 0;

            var superMinType = CopyType.SuperMin;
            var mediumType = CopyType.Medium;

            var thumbs = await imageProcessor.ProcessCopies(ms, superMinType, mediumType);

            AppFile appFile;

            if (thumbs.ContainsKey(mediumType))
            {
                var minFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[superMinType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[mediumType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(minFile, mediumFile, null, request.File.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, user.Id);
            }
            else if(thumbs.ContainsKey(superMinType))
            {
                var minFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[superMinType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                var defaultFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(minFile, defaultFile, null, request.File.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, user.Id);
            }
            else
            {
                var minFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                appFile = new AppFile(minFile, null, null, request.File.ContentType, thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, user.Id);
            }

            var success = await userRepository.UpdatePhoto(user, appFile);
            if (success)
            {
                return new AnswerChangeUserPhoto() { Success = true, Id = appFile.Id, PhotoPath = appFile.GetNotNullPathes().Last() };
            }
            else
            {
                await _mediator.Send(new RemoveFilesByPathesCommand(user.Id.ToString(), appFile.GetNotNullPathes()));

                return new AnswerChangeUserPhoto { Success = false };
            }
        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.LanguageId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateThemeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.ThemeId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateFontSizeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.FontSizeId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }
    }
}

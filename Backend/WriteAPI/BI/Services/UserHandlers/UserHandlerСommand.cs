using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Users;
using ContentProcessing;
using Domain.Commands.Files;
using Domain.Commands.Users;
using MediatR;
using Storage;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
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

        private readonly IFilesStorage filesStorage;

        private readonly IImageProcessor imageProcessor;

        private readonly UserProfilePhotoRepository userProfilePhotoRepository;

        private readonly IMediator _mediator;

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        public UserHandlerСommand(
            UserRepository userRepository,
            IFilesStorage filesStorage,
            FileRepository fileRepository,
            IImageProcessor imageProcessor,
            UserProfilePhotoRepository userProfilePhotoRepository,
            IMediator _mediator,
            PersonalizationSettingRepository personalizationSettingRepository)
        {
            this.userRepository = userRepository;
            this.filesStorage = filesStorage;
            this.fileRepository = fileRepository;
            this.imageProcessor = imageProcessor;
            this.userProfilePhotoRepository = userProfilePhotoRepository;
            this._mediator = _mediator;
            this.personalizationSettingRepository = personalizationSettingRepository;
        }

        public async Task<Unit> Handle(NewUserCommand request, CancellationToken cancellationToken)
        {

            var user = new User()
            {
                Name = request.Name,
                LanguageId = LanguageENUM.English,
                Email = request.Email,
                FontSizeId = FontSizeENUM.Medium,
                ThemeId = ThemeENUM.Dark,
                BillingPlanId = BillingPlanTypeENUM.Basic
            };

            await userRepository.AddAsync(user);

            await filesStorage.CreateUserContainer(user.Id);

            await personalizationSettingRepository.AddAsync(new PersonalizationSetting().GetNewFactory(user.Id));

            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateMainUserInfoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.Name = request.Name;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<AnswerChangeUserPhoto> Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            var userProfilePhoto = await userProfilePhotoRepository.GetWithFile(user.Id);

            if (userProfilePhoto != null)
            {
                await userProfilePhotoRepository.RemoveAsync(userProfilePhoto);
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), userProfilePhoto.AppFile).SetIsNoCheckDelete());
            }

            var photoType = FileHelper.GetExtension(request.File.FileName);

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
                    thumbs[superMinType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, user.Id, request.File.FileName);
            }
            else if (thumbs.ContainsKey(superMinType))
            {
                var minFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[superMinType].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                var defaultFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);

                appFile = new AppFile(minFile, defaultFile, null, request.File.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, user.Id, request.File.FileName);
            }
            else
            {
                var minFile = await filesStorage.SaveFile(user.Id.ToString(), thumbs[CopyType.Default].Bytes, request.File.ContentType, ContentTypesFile.Images, photoType);
                appFile = new AppFile(minFile, null, null, request.File.ContentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, user.Id, request.File.FileName);
            }

            var success = await userRepository.UpdatePhoto(user, appFile);
            if (success)
            {
                return new AnswerChangeUserPhoto() { Success = true, Id = appFile.Id, PhotoPath = appFile.GetNotNullPathes().Last() };
            }
            else
            {
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), appFile));

                return new AnswerChangeUserPhoto { Success = false };
            }
        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.LanguageId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateThemeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.ThemeId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateFontSizeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.FontSizeId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }
    }
}

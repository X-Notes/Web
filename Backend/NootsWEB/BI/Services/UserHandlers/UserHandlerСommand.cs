using System;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.Users;
using Domain.Commands.Users;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using Noots.Storage.Commands;
using WriteContext.Repositories.Users;

namespace BI.Services.UserHandlers
{
    public class UserHandlerСommand :
        IRequestHandler<NewUserCommand, Guid>,
        IRequestHandler<UpdateMainUserInfoCommand, Unit>,
        IRequestHandler<UpdatePhotoCommand, OperationResult<AnswerChangeUserPhoto>>,
        IRequestHandler<UpdateLanguageCommand, Unit>,
        IRequestHandler<UpdateThemeCommand, Unit>,
        IRequestHandler<UpdateFontSizeCommand, Unit>
    {
        private readonly UserRepository userRepository;

        private readonly UserProfilePhotoRepository userProfilePhotoRepository;

        private readonly IMediator _mediator;

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        private readonly UserBackgroundMapper userBackgroundMapper;

        public UserHandlerСommand(
            UserRepository userRepository,
            UserProfilePhotoRepository userProfilePhotoRepository,
            IMediator _mediator,
            PersonalizationSettingRepository personalizationSettingRepository,
            UserBackgroundMapper userBackgroundMapper)
        {
            this.userRepository = userRepository;
            this.userProfilePhotoRepository = userProfilePhotoRepository;
            this._mediator = _mediator;
            this.personalizationSettingRepository = personalizationSettingRepository;
            this.userBackgroundMapper = userBackgroundMapper;
        }

        public async Task<Guid> Handle(NewUserCommand request, CancellationToken cancellationToken)
        {

            var user = new User()
            {
                Name = request.Name,
                LanguageId = LanguageENUM.English,
                Email = request.Email,
                FontSizeId = FontSizeENUM.Medium,
                ThemeId = ThemeENUM.Dark,
                BillingPlanId = BillingPlanTypeENUM.Free,
                DefaultPhotoUrl = request.PhotoURL
            };

            await userRepository.AddAsync(user);

            await _mediator.Send(new CreateUserContainerCommand(user.Id));

            await personalizationSettingRepository.AddAsync(new PersonalizationSetting().GetNewFactory(user.Id));

            return user.Id;
        }

        public async Task<Unit> Handle(UpdateMainUserInfoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.Name = request.Name;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<OperationResult<AnswerChangeUserPhoto>> Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);

            var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.File.Length, user.Id));
            if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
            {
                return new OperationResult<AnswerChangeUserPhoto>().SetNoEnougnMemory();
            }

            var userProfilePhoto = await userProfilePhotoRepository.GetWithFile(user.Id);

            if (userProfilePhoto != null)
            {
                await userProfilePhotoRepository.RemoveAsync(userProfilePhoto);
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), userProfilePhoto.AppFile));
            }

            var filebytes = await request.File.GetFilesBytesAsync();
            var appFile = await _mediator.Send(new SaveUserPhotoCommand(user.Id, filebytes));

            var success = await userRepository.UpdatePhoto(user, appFile);
            if (success)
            {
                var result = new AnswerChangeUserPhoto() { Success = true, Id = appFile.Id, PhotoPath = userBackgroundMapper.BuildFilePath(request.UserId, appFile.GetFromSmallPath) };
                return new OperationResult<AnswerChangeUserPhoto>(true, result);
            }
            else
            {
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), appFile));
                return new OperationResult<AnswerChangeUserPhoto>(false, null);
            }
        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.LanguageId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateThemeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.ThemeId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateFontSizeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.FontSizeId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }
    }
}

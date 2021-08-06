using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Users;
using Domain.Commands.Files;
using Domain.Commands.Users;
using MediatR;
using Storage;
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

        private readonly UserProfilePhotoRepository userProfilePhotoRepository;

        private readonly IMediator _mediator;

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        public UserHandlerСommand(
            UserRepository userRepository,
            UserProfilePhotoRepository userProfilePhotoRepository,
            IMediator _mediator,
            PersonalizationSettingRepository personalizationSettingRepository)
        {
            this.userRepository = userRepository;
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

            await _mediator.Send(new CreateUserContainerCommand(user.Id));

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

            var filebytes = await request.File.GetFilesBytesAsync();
            var appFile = await _mediator.Send(new SaveUserPhotoCommand(user.Id, filebytes));

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

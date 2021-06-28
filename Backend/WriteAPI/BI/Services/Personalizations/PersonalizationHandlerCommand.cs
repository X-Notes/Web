using System;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Domain.Commands.Personalizations;
using MediatR;
using WriteContext.Repositories.Users;

namespace BI.Services.Personalizations
{
    public class PersonalizationHandlerCommand
        : IRequestHandler<UpdatePersonalizationSettingsCommand, Unit>
    {

        private readonly UserRepository userRepository;

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        private readonly AppCustomMapper appCustomMapper;

        public PersonalizationHandlerCommand(
            UserRepository userRepository,
            PersonalizationSettingRepository personalizationSettingRepository,
            AppCustomMapper appCustomMapper)
        {
            this.userRepository = userRepository;
            this.personalizationSettingRepository = personalizationSettingRepository;
            this.appCustomMapper = appCustomMapper;
        }

        public async Task<Unit> Handle(UpdatePersonalizationSettingsCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == user.Id);

                pr.IsViewAudioOnNote = request.PersonalizationSetting.IsViewAudioOnNote;
                pr.IsViewDocumentOnNote = request.PersonalizationSetting.IsViewDocumentOnNote;
                pr.IsViewPhotosOnNote = request.PersonalizationSetting.IsViewPhotosOnNote;
                pr.IsViewTextOnNote = request.PersonalizationSetting.IsViewTextOnNote;
                pr.IsViewVideoOnNote = request.PersonalizationSetting.IsViewVideoOnNote;
                pr.NotesInFolderCount = request.PersonalizationSetting.NotesInFolderCount;

                await personalizationSettingRepository.Update(pr);

                return Unit.Value;
            }

            throw new Exception("User not found");
        }
    }
}

using MediatR;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Personalization.Commands;

namespace Noots.Personalization.Impl
{
    public class PersonalizationHandlerCommand
        : IRequestHandler<UpdatePersonalizationSettingsCommand, Unit>
    {

        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        public PersonalizationHandlerCommand(PersonalizationSettingRepository personalizationSettingRepository)
        {
            this.personalizationSettingRepository = personalizationSettingRepository;
        }

        public async Task<Unit> Handle(UpdatePersonalizationSettingsCommand request, CancellationToken cancellationToken)
        {
            var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);
            pr.IsViewAudioOnNote = request.PersonalizationSetting.IsViewAudioOnNote;
            pr.IsViewDocumentOnNote = request.PersonalizationSetting.IsViewDocumentOnNote;
            pr.IsViewPhotosOnNote = request.PersonalizationSetting.IsViewPhotosOnNote;
            pr.IsViewTextOnNote = request.PersonalizationSetting.IsViewTextOnNote;
            pr.IsViewVideoOnNote = request.PersonalizationSetting.IsViewVideoOnNote;
            pr.NotesInFolderCount = request.PersonalizationSetting.NotesInFolderCount;
            pr.ContentInNoteCount = request.PersonalizationSetting.ContentInNoteCount;
            pr.SortedNoteByTypeId = request.PersonalizationSetting.SortedNoteByTypeId;
            pr.SortedFolderByTypeId = request.PersonalizationSetting.SortedFolderByTypeId;

            await personalizationSettingRepository.UpdateAsync(pr);

            return Unit.Value;
        }
    }
}

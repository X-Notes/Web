using Common.DatabaseModels.Models.Users;
using Common.DTO.Personalization;
using MediatR;
using Noots.Personalization.Queries;
using WriteContext.Repositories.Users;

namespace Noots.Personalization.Impl
{
    public class PersonalizationHandlerQuery : IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>
    {
        private readonly PersonalizationSettingRepository personalizationSettingRepository;

        public PersonalizationHandlerQuery(PersonalizationSettingRepository personalizationSettingRepository)
        {
            this.personalizationSettingRepository = personalizationSettingRepository;
        }

        public async Task<PersonalizationSettingDTO> Handle(GetUserPersonalizationSettingsQuery request, CancellationToken cancellationToken)
        {
            var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);
            return MapPersonalizationSettingToPersonalizationSettingDTO(pr);
        }

        private PersonalizationSettingDTO MapPersonalizationSettingToPersonalizationSettingDTO(PersonalizationSetting pr)
        {
            if (pr == null)
            {
                return null;
            }

            return new PersonalizationSettingDTO()
            {
                IsViewAudioOnNote = pr.IsViewAudioOnNote,
                IsViewDocumentOnNote = pr.IsViewDocumentOnNote,
                IsViewPhotosOnNote = pr.IsViewPhotosOnNote,
                IsViewTextOnNote = pr.IsViewTextOnNote,
                IsViewVideoOnNote = pr.IsViewVideoOnNote,
                NotesInFolderCount = pr.NotesInFolderCount,
                ContentInNoteCount = pr.ContentInNoteCount,
                SortedNoteByTypeId = pr.SortedNoteByTypeId,
                SortedFolderByTypeId = pr.SortedFolderByTypeId
            };
        }
    }
}

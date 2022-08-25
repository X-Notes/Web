using Common.DTO;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Personalization.Commands;
using Noots.Personalization.Entities;

namespace Noots.Personalization.Impl
{
    public class PersonalizationHandlerCommand
        : IRequestHandler<UpdatePersonalizationSettingsCommand, OperationResult<Unit>>
    {

        private readonly PersonalizationSettingRepository personalizationSettingRepository;
        private readonly BillingPermissionService billingPermissionService;

        public PersonalizationHandlerCommand(
            PersonalizationSettingRepository personalizationSettingRepository,
            BillingPermissionService billingPermissionService)
        {
            this.personalizationSettingRepository = personalizationSettingRepository;
            this.billingPermissionService = billingPermissionService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdatePersonalizationSettingsCommand request, CancellationToken cancellationToken)
        {
            var isPremiumPlan = await billingPermissionService.IsUserPlanPremiumAsync(request.UserId);
            if (!isPremiumPlan)
            {
                return new OperationResult<Unit>().SetBillingError();
;           }
            
            var pr = await personalizationSettingRepository.FirstOrDefaultAsync(x => x.UserId == request.UserId);
            pr.IsViewAudioOnNote = request.PersonalizationSetting.IsViewAudioOnNote;
            pr.IsViewDocumentOnNote = request.PersonalizationSetting.IsViewDocumentOnNote;
            pr.IsViewPhotosOnNote = request.PersonalizationSetting.IsViewPhotosOnNote;
            pr.IsViewTextOnNote = request.PersonalizationSetting.IsViewTextOnNote;
            pr.IsViewVideoOnNote = request.PersonalizationSetting.IsViewVideoOnNote;

            var notesInFolderCount = request.PersonalizationSetting.NotesInFolderCount;
            pr.NotesInFolderCount = notesInFolderCount > PersonalizationConstraint.maxNotesInFolderCount ? PersonalizationConstraint.maxNotesInFolderCount : notesInFolderCount;
            
            var contentInNoteCount = request.PersonalizationSetting.ContentInNoteCount;
            pr.ContentInNoteCount = contentInNoteCount > PersonalizationConstraint.maxContentInNoteCount ? PersonalizationConstraint.maxContentInNoteCount : contentInNoteCount;
            
            pr.SortedNoteByTypeId = request.PersonalizationSetting.SortedNoteByTypeId;
            pr.SortedFolderByTypeId = request.PersonalizationSetting.SortedFolderByTypeId;

            await personalizationSettingRepository.UpdateAsync(pr);

            return new OperationResult<Unit>(true, Unit.Value);
        }
    }
}

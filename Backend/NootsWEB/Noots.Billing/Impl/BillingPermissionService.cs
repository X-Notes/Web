using Common.DatabaseModels.Models.Plan;
using Noots.Billing.Entities;
using Noots.DatabaseContext.Repositories.Billing;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Users;

namespace Noots.Billing.Impl;

public class BillingPermissionService
{
    private readonly BillingPlanCacheRepository vBillingPlanCacheRepository;
    private readonly UserRepository userRepository;
    private readonly NoteRepository noteRepository;
    private readonly FolderRepository folderRepository;
    private readonly LabelRepository labelRepository;
    private readonly BackgroundRepository backgroundRepository;
    private readonly RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository;

    public BillingPermissionService(
        BillingPlanCacheRepository vBillingPlanCacheRepository, 
        UserRepository userRepository,
        NoteRepository noteRepository,
        FolderRepository folderRepository,
        LabelRepository labelRepository,
        BackgroundRepository backgroundRepository,
        RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository)
    {
        this.vBillingPlanCacheRepository = vBillingPlanCacheRepository;
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.folderRepository = folderRepository;
        this.labelRepository = labelRepository;
        this.backgroundRepository = backgroundRepository;
        this.relatedNoteToInnerNoteRepository = relatedNoteToInnerNoteRepository;
    }

    public async Task<bool> CanCreateNoteAsync(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return false;
        
        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        
        var userNotesCount = await noteRepository.GetCountAsync(x => x.UserId == user.Id);
        if (userNotesCount >= userPlan.MaxNotes) return false;
        
        return true;
    }

    public async Task<bool> CanCreateBackgroundAsync(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return false;

        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);

        var userLabelsCount = await backgroundRepository.GetCountAsync(x => x.UserId == user.Id);
        if (userLabelsCount >= userPlan.MaxBackgrounds) return false;

        return true;
    }

    public async Task<int> GetAvailableCountNotes(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return 0;
        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        var userNotesCount = await noteRepository.GetCountAsync(x => x.UserId == user.Id);
        return userPlan.MaxNotes - userNotesCount;
    }
    
    public async Task<bool> CanCreateFolderAsync(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return false;
        
        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        
        var userFoldersCount = await folderRepository.GetCountAsync(x => x.UserId == user.Id);
        if (userFoldersCount >= userPlan.MaxFolders) return false;
        
        return true;
    }
    
    public async Task<int> GetAvailableCountFolders(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return 0;
        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        var userFoldersCount = await folderRepository.GetCountAsync(x => x.UserId == user.Id);
        return userPlan.MaxFolders - userFoldersCount;
    }
    
    public async Task<bool> CanCreateLabelAsync(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return false;
        
        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        
        var userLabelsCount = await labelRepository.GetCountAsync(x => x.UserId == user.Id);
        if (userLabelsCount >= userPlan.MaxLabels) return false;
        
        return true;
    }
    
    public async Task<int> GetAvailableCountRelatedNotes(Guid userId, Guid noteId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return 0;
        
        var userPlan = await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        var countNotes = await relatedNoteToInnerNoteRepository.GetCountAsync(x => x.NoteId == noteId);
        
        return userPlan.MaxRelatedNotes - countNotes;
    }
    
    public async Task<BillingPlan> GetUserPlanAsync(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return null;
        return await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
    }
    
    public async Task<bool> IsUserPlanPremiumAsync(Guid userId)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return false;
        var plan =  await vBillingPlanCacheRepository.FirstOrDefaultCacheAsync(user.BillingPlanId);
        return plan.Name == nameof(BillingPlanTypeENUM.Premium);
    }
    
    public async Task<List<BillingPlanDTO>> GetPlansAsync()
    {
        var ents = await vBillingPlanCacheRepository.GetAllCacheAsync();
        return ents.Select(x => new BillingPlanDTO(x)).ToList();
    }
}
using Common.DatabaseModels.Models.Plan;

namespace Noots.Billing.Entities;

public class BillingPlanDTO
{
    public BillingPlanTypeENUM Id { set; get; } 
    
    public long MaxSize { set; get; }

    public int MaxNotes { set; get; }
        
    public int MaxFolders { set; get; }
        
    public int MaxLabels { set; get; }
        
    public int MaxRelatedNotes { set; get; }

    public int MaxUserAtSameTimeOnNote { set; get; }

    public int MaxUserAtSameTimeOnFolder { set; get; }

    public int MaxBackgrounds { set; get; }

    public string Name { set; get; }
    
    public double Price { set; get; }

    public BillingPlanDTO(BillingPlan plan)
    {
        Id = plan.Id;
        MaxSize = plan.MaxSize;
        MaxFolders = plan.MaxFolders;
        MaxNotes = plan.MaxNotes;
        MaxLabels = plan.MaxLabels;
        MaxRelatedNotes = plan.MaxRelatedNotes;
        Name = plan.Name;
        Price = plan.Price;
        MaxUserAtSameTimeOnNote = plan.MaxUserAtSameTimeOnNote;
        MaxUserAtSameTimeOnFolder = plan.MaxUserAtSameTimeOnFolder;
        MaxBackgrounds = plan.MaxLabels;
    }
}
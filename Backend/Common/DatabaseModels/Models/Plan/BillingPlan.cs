using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Plan
{
    [Table(nameof(BillingPlan), Schema = SchemeConfig.User)]
    public class BillingPlan : BaseEntity<BillingPlanTypeENUM>
    {
        public long MaxSize { set; get; }
            
        public int MaxNotes { set; get; }
        
        public int MaxFolders { set; get; }
        
        public int MaxLabels { set; get; }
        
        public int MaxRelatedNotes { set; get; }

        public int MaxBackgrounds { set; get; }
        
        public string Name { set; get; }
        
        public double Price { set; get; }
        
        public List<User> Users { set; get; }
    }
}

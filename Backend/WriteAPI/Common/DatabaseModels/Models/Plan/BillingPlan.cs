using System.Collections.Generic;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Plan
{
    public class BillingPlan : BaseEntity<BillingPlanTypeENUM>
    {
        public long MaxSize { set; get; }
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

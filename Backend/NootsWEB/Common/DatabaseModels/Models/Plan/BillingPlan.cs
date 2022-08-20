using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Plan
{
    [Table(nameof(BillingPlan), Schema = SchemeConfig.User)]
    public class BillingPlan : BaseEntity<BillingPlanTypeENUM>
    {
        public long MaxSize { set; get; }
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

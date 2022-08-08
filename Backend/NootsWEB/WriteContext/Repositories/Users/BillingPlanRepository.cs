using Common.DatabaseModels.Models.Plan;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    public class BillingPlanRepository : Repository<BillingPlan, BillingPlanTypeENUM>
    {
        public BillingPlanRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }
    }
}

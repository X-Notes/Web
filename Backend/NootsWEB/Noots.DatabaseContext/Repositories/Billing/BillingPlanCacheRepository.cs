using Common.DatabaseModels.Models.Plan;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Billing
{
    public class BillingPlanCacheRepository : Repository<BillingPlan, BillingPlanTypeENUM>
    {
        public BillingPlanCacheRepository(NootsDBContext contextDB)
                : base(contextDB)
        {
        }
    }
}

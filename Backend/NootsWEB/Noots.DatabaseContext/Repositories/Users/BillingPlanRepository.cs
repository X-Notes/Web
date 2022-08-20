using Common.DatabaseModels.Models.Plan;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Users
{
    public class BillingPlanRepository : Repository<BillingPlan, BillingPlanTypeENUM>
    {
        public BillingPlanRepository(NootsDBContext contextDB)
                : base(contextDB)
        {
        }
    }
}

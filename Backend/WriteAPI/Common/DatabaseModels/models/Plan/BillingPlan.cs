using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Plan
{
    public class BillingPlan : BaseEntity
    {
        public long MaxSize { set; get; }
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

using System.Collections.Generic;
using Common.DatabaseModels.Models.Plan;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Systems
{
    [Table(nameof(Theme), Schema = SchemeConfig.Systems)]
    public class Theme : BaseEntity<ThemeENUM>
    {
        public string Name { set; get; }

        public List<User> Users { set; get; }
    }
}

using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Systems
{
    public class FontSize : BaseEntity
    {
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

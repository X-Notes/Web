using System.Collections.Generic;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Systems
{
    public class FontSize : BaseEntity<FontSizeENUM>
    {
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

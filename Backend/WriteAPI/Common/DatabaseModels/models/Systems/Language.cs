using Common.DatabaseModels.models.Users;
using System.Collections.Generic;

namespace Common.DatabaseModels.models.Systems
{
    public class Language : BaseEntity<LanguageENUM>
    {
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

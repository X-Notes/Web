using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Systems
{
    [Table(nameof(Language), Schema = SchemeConfig.Systems)]
    public class Language : BaseEntity<LanguageENUM>
    {
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

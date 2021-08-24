using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Systems
{
    [Table(nameof(FontSize), Schema = SchemeConfig.Systems)]
    public class FontSize : BaseEntity<FontSizeENUM>
    {
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}

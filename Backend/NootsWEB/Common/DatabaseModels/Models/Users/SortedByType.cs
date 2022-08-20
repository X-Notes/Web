using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Users
{
    [Table(nameof(SortedByType), Schema = SchemeConfig.User)]
    public class SortedByType : BaseEntity<SortedByENUM>
    {
        public string Name { set; get; }

        public List<PersonalizationSetting> PersonalizationSettingsFolders { set; get; }
        public List<PersonalizationSetting> PersonalizationSettingsNotes { set; get; }
    }
}

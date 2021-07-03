using System.Collections.Generic;


namespace Common.DatabaseModels.Models.Users
{
    public class SortedByType : BaseEntity<SortedByENUM>
    {
        public string Name { set; get; }

        public List<PersonalizationSetting> PersonalizationSettingsFolders { set; get; }
        public List<PersonalizationSetting> PersonalizationSettingsNotes { set; get; }
    }
}

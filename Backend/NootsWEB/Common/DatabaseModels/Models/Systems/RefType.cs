using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;

namespace Common.DatabaseModels.Models.Systems
{
    [Table(nameof(RefType), Schema = SchemeConfig.Systems)]
    public class RefType : BaseEntity<RefTypeENUM>
    {
        public string Name { set; get; }
        public List<Note> Notes { set; get; }
        public List<Folder> Folders { set; get; }
        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
        public List<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }
    }
}

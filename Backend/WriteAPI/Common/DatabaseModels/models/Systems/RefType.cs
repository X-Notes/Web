using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.Notes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Systems
{
    public class RefType : BaseEntity<RefTypeENUM>
    {
        public string Name { set; get; }
        public List<Note> Notes { set; get; }
        public List<Folder> Folders { set; get; }
        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }
        public List<UserOnPrivateNotes> UserOnPrivateNotes { set; get; }
    }
}

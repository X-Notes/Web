using Common.DatabaseModels.models.Users;
using Common.DTO.users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.history
{
    public class NoteHistoryDTO
    {
        public DateTimeOffset SnapshotTime { set; get; }
        public List<UserNoteHistory> Users { set; get; }

        public NoteHistoryDTO()
        {

        }

        public NoteHistoryDTO(DateTimeOffset SnapshotTime, List<UserNoteHistory> Users)
        {
            this.SnapshotTime = SnapshotTime;
            this.Users = Users;
        }
    }
}

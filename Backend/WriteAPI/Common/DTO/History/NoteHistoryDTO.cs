using System;
using System.Collections.Generic;
using Common.DTO.Users;

namespace Common.DTO.History
{
    public class NoteHistoryDTO
    {
        public DateTimeOffset SnapshotTime { set; get; }

        public List<UserNoteHistory> Users { set; get; }

        public Guid NoteVersionId { set; get; }

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

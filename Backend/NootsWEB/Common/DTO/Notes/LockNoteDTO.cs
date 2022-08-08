using System;

namespace Common.DTO.Notes
{
    public class LockNoteDTO : BaseNoteDTO
    {
        public bool IsLocked { set; get; }

        public bool IsLockedNow { set; get; }

        public DateTimeOffset? UnlockedTime { set; get; }
    }
}

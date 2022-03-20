using Common;
using Common.Timers;
using System;
using System.Collections.Concurrent;
using System.Linq;

namespace BI.Services.Encryption
{
    public class UserNoteEncryptStorage
    {
        protected static ConcurrentDictionary<Guid, DateTimeOffset> noteId_unlockTime = new ConcurrentDictionary<Guid, DateTimeOffset>();
        private readonly TimersConfig timersConfig;

        public UserNoteEncryptStorage(TimersConfig timersConfig)
        {
            this.timersConfig = timersConfig;
        }

        public bool SetUnlockTime(Guid noteId)
        {
            if (!noteId_unlockTime.ContainsKey(noteId))
            {
                noteId_unlockTime.TryAdd(noteId, DateTimeProvider.Time);
                return true;
            }
            return false;
        }

        public bool IsUnlocked(Guid noteId) => noteId_unlockTime.ContainsKey(noteId) && noteId_unlockTime[noteId].AddMinutes(timersConfig.UnlockTimeMinutes) > DateTimeProvider.Time; 

        public void ClearTimers()
        {
            var valuesToRemove = noteId_unlockTime.Where(x => x.Value.AddMinutes(timersConfig.UnlockTimeMinutes) > DateTimeProvider.Time);
            foreach(var value in valuesToRemove)
            {
                noteId_unlockTime.TryRemove(value);
            }
        }
    }
}

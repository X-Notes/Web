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
                return noteId_unlockTime.TryAdd(noteId, DateTimeProvider.Time);
            }

            return noteId_unlockTime.TryUpdate(noteId, DateTimeProvider.Time, noteId_unlockTime[noteId]);
        }

        public bool RemoveUnlockTime(Guid noteId)
        {
            if (noteId_unlockTime.ContainsKey(noteId))
            {
                return noteId_unlockTime.TryRemove(noteId, out var value);
            }

            return true;
        }

        public bool IsUnlocked(Guid noteId)
        {
            if (noteId_unlockTime.ContainsKey(noteId))
            {
                var value = noteId_unlockTime[noteId];
                var flag = value.AddMinutes(timersConfig.UnlockTimeMinutes) > DateTimeProvider.Time;
                return flag;
            }

            return false;
        } 

        public void ClearTimers()
        {
            var valuesToRemove = noteId_unlockTime.Where(x =>
            {
                var time = x.Value;
                return time.AddMinutes(timersConfig.UnlockTimeMinutes) < DateTimeProvider.Time;
            });
            foreach(var value in valuesToRemove)
            {
                noteId_unlockTime.TryRemove(value);
            }
        }
    }
}

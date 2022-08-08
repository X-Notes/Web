using Common;
using Common.DatabaseModels.Models.Notes;
using Common.Timers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Notes;

namespace BI.Services.Encryption
{
    public class UserNoteEncryptService
    {
        private readonly TimersConfig timersConfig;
        private readonly NoteRepository noteRepository;

        public UserNoteEncryptService(
            TimersConfig timersConfig,
            NoteRepository noteRepository)
        {
            this.timersConfig = timersConfig;
            this.noteRepository = noteRepository;
        }

        public async Task SetUnlockTime(Guid noteId)
        {
            var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == noteId);
            if(note != null)
            {
                note.UnlockTime = DateTimeProvider.Time;
                await noteRepository.UpdateAsync(note);
            }
        }

        public async Task RemoveUnlockTime(Guid noteId)
        {
            var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == noteId);
            if (note != null)
            {
                note.UnlockTime = null;
                await noteRepository.UpdateAsync(note);
            }
        }

        public bool IsUnlocked(DateTimeOffset? time)
        {
            if(time != null)
            {
                return time.Value.AddMinutes(timersConfig.UnlockTimeMinutes) > DateTimeProvider.Time;
            }

            return false;
        } 
    }
}

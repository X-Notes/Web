using Common;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Encryption.Entities;

namespace Noots.Encryption.Impl
{
    public class UserNoteEncryptService
    {
        private readonly UnlockConfig unlockConfig;
        private readonly NoteRepository noteRepository;

        public UserNoteEncryptService(
            UnlockConfig unlockConfig,
            NoteRepository noteRepository)
        {
            this.unlockConfig = unlockConfig;
            this.noteRepository = noteRepository;
        }

        public async Task SetUnlockTime(Guid noteId)
        {
            var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == noteId);
            if (note != null)
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
            if (time != null)
            {
                return time.Value.AddMinutes(unlockConfig.UnlockTimeMinutes) > DateTimeProvider.Time;
            }

            return false;
        }
    }
}

using System;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class AudiosCollectionNoteRepository : Repository<AudiosCollectionNote, Guid>
    {
        public AudiosCollectionNoteRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }

        public async Task<AudiosCollectionNote> GetOneIncludeAudioNoteAppFiles(Guid id)
        {
            return await entities.Include(x => x.AudioNoteAppFiles).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<AudiosCollectionNote> GetOneIncludeAudios(Guid id)
        {
            return await entities.Include(x => x.Audios).FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}

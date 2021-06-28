using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent, Guid>
    {
        public BaseNoteContentRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }

        public async Task<List<BaseNoteContent>> GetAllContentByNoteIdOrdered(Guid id)
        {
            return await entities
                .Include(x => (x as AlbumNote).Photos)
                .Include(x => (x as VideoNote).AppFile)
                .Include(x => (x as AudiosPlaylistNote).Audios)
                .Include(x => (x as DocumentNote).AppFile)
                .Where(x => x.NoteId == id)
                .OrderBy(x => x.Order)
                .ToListAsync();

        }

        public async Task<T> GetContentById<T>(Guid id) where T : BaseNoteContent
        {
            return await entities
                .Include(x => (x as AlbumNote).Photos)
                .Include(x => (x as VideoNote).AppFile)
                .Include(x => (x as AudiosPlaylistNote).Audios)
                .Include(x => (x as DocumentNote).AppFile)
                .Cast<T>()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<BaseNoteContent>> GetContentByNoteIds(List<Guid> ids)
        {
            return await entities
                .Include(x => (x as AlbumNote).Photos)
                .Include(x => (x as VideoNote).AppFile)
                .Include(x => (x as AudiosPlaylistNote).Audios)
                .Include(x => (x as DocumentNote).AppFile)
                .Where(x => ids.Contains(x.NoteId)).ToListAsync();
        }

    }
}

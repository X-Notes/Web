using Common.DatabaseModels.models.NoteContent;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent>
    {
        public BaseNoteContentRepository(WriteContextDB contextDB)
            :base(contextDB)
        {

        }

        public async Task<List<BaseNoteContent>> GetAllContentByNoteId(Guid id)
        {
            return await entities
                .Include(x => (x as AlbumNote).Photos)
                .Where(x => x.NoteId == id)
                .ToListAsync();

        }

        public async Task<T> GetContentById<T>(Guid id) where T : BaseNoteContent
        {
            return await entities
                .Include(x => (x as AlbumNote).Photos)
                .Cast<T>()
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}

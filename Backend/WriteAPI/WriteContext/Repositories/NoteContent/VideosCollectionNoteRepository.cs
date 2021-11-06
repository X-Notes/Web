using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class VideosCollectionNoteRepository : Repository<VideosCollectionNote, Guid>
    {
        public VideosCollectionNoteRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }

        public async Task<VideosCollectionNote> GetOneIncludeVideoNoteAppFiles(Guid id)
        {
            return await entities.Include(x => x.VideoNoteAppFiles).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<VideosCollectionNote> GetOneIncludeVideos(Guid id)
        {
            return await entities.Include(x => x.Videos).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<VideosCollectionNote>> GetManyIncludeVideoNoteAppFiles(List<Guid> ids)
        {
            return await entities.Include(x => x.VideoNoteAppFiles).Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public async Task<List<VideosCollectionNote>> GetManyIncludeVideos(List<Guid> ids)
        {
            return await entities.Include(x => x.Videos).Where(x => ids.Contains(x.Id)).ToListAsync();
        }
    }
}

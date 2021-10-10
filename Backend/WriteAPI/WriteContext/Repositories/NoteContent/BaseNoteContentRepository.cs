using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;

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
                .Include(x => (x as PhotosCollectionNote).Photos)
                .Include(x => (x as VideosCollectionNote).Videos)
                .Include(x => (x as AudiosCollectionNote).Audios)
                .Include(x => (x as DocumentsCollectionNote).Documents)
                .Where(x => x.NoteId == id)
                .OrderBy(x => x.Order)
                .ToListAsync();
        }

        public async Task<List<BaseNoteContent>> GetAllContentBySnapshotIdOrdered(Guid snapshotId)
        {
            return await entities
                .Include(x => (x as PhotosCollectionNote).Photos)
                .Include(x => (x as VideosCollectionNote).Videos)
                .Include(x => (x as AudiosCollectionNote).Audios)
                .Include(x => (x as DocumentsCollectionNote).Documents)
                .Where(x => x.NoteSnapshotId == snapshotId)
                .OrderBy(x => x.Order)
                .ToListAsync();
        }

        public async Task<T> GetContentById<T>(Guid id) where T : BaseNoteContent
        {
            return await entities // TODO OPTIMIZATION
                .Include(x => (x as PhotosCollectionNote).Photos)
                .Include(x => (x as VideosCollectionNote).Videos)
                .Include(x => (x as AudiosCollectionNote).Audios)
                .Include(x => (x as DocumentsCollectionNote).Documents)
                .Cast<T>()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<BaseNoteContent>> GetContentByNoteIds(List<Guid> ids)
        {
            return await entities
                .Include(x => (x as PhotosCollectionNote).Photos)
                .Include(x => (x as VideosCollectionNote).Videos)
                .Include(x => (x as AudiosCollectionNote).Audios)
                .Include(x => (x as DocumentsCollectionNote).Documents)
                .Where(x => ids.Contains(x.NoteId.Value)).ToListAsync();
        }

    }
}

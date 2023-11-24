using Common.DatabaseModels.Models.NoteContent.FileContent;
using DatabaseContext.GenericRepositories;
using Microsoft.EntityFrameworkCore;

namespace DatabaseContext.Repositories.NoteContent
{
    public class CollectionAppFileRepository : Repository<CollectionNoteAppFile, Guid>
    {
        public CollectionAppFileRepository(ApiDbContext contextDB)
        : base(contextDB)
        {
        }

        public Task<List<Guid>> GetFileIdsThatExist(params Guid[] ids)
        {
            return entities.Where(x => ids.Contains(x.AppFileId)).Select(x => x.AppFileId).ToListAsync();
        }

        public Task<List<CollectionNoteAppFile>> GetAppFilesByContentIds(List<Guid> contentIds)
        {
            return entities.Include(x => x.AppFile).Where(x => contentIds.Contains(x.CollectionNoteId)).ToListAsync();
        }

        public Task<List<CollectionNoteAppFile>> GetCollectionItems(List<Guid> fileIds, Guid contentId)
        {
            return entities.Include(x => x.AppFile).Where(x => fileIds.Contains(x.AppFileId) && x.CollectionNoteId == contentId).ToListAsync();
        }
    }
}

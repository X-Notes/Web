using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class AudioNoteAppFileRepository : Repository<AudioNoteAppFile, Guid>
    {
        public AudioNoteAppFileRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }


        public Task<List<AudioNoteAppFile>> GetAppFilesByContentIds(List<Guid> contentIds)
        {
            return entities.Include(x => x.AppFile).Where(x => contentIds.Contains(x.AudiosCollectionNoteId)).ToListAsync();
        }

        public Task<List<Guid>> GetFileIdsThatExist(params Guid[] ids)
        {
            return entities.Where(x => ids.Contains(x.AppFileId)).Select(x => x.AppFileId).ToListAsync();
        }
    }
}

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


        public Task<List<AppFile>> GetAppFilesByContentId(Guid contentId)
        {
            return entities.Include(x => x.AppFile).Where(x => x.AudiosCollectionNoteId == contentId).Select(x => x.AppFile).ToListAsync();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class VideoNoteRepository : Repository<VideoNote, Guid>
    {
        public VideoNoteRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }

        public async Task<List<Guid>> ExistGroupByContainsIds(IEnumerable<Guid> ids)
        {
            return await entities.Where(x => ids.Contains(x.AppFileId))
                .GroupBy(x => x.AppFileId).Select(x => x.Key).ToListAsync();
        }
    }
}

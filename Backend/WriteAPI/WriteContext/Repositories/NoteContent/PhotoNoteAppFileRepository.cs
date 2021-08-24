using Common.DatabaseModels.Models.Files.Contents;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class PhotoNoteAppFileRepository : Repository<PhotoNoteAppFile, Guid>
    {
        public PhotoNoteAppFileRepository(WriteContextDB contextDB)
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

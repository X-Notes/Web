using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class DocumentsCollectionNoteRepository : Repository<DocumentsCollectionNote, Guid>
    {
        public DocumentsCollectionNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task<DocumentsCollectionNote> GetOneIncludeDocumentNoteAppFiles(Guid id)
        {
            return await entities.Include(x => x.DocumentNoteAppFiles).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<DocumentsCollectionNote> GetOneIncludeDocuments(Guid id)
        {
            return await entities.Include(x => x.Documents).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<DocumentsCollectionNote>> GetManyIncludeDocumentNoteAppFiles(List<Guid> ids)
        {
            return await entities.Include(x => x.DocumentNoteAppFiles).Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public async Task<List<DocumentsCollectionNote>> GetManyIncludeDocuments(List<Guid> ids)
        {
            return await entities.Include(x => x.Documents).Where(x => ids.Contains(x.Id)).ToListAsync();
        }
    }
}

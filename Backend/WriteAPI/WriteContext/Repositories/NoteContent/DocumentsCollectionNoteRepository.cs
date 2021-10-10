using System;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class DocumentsCollectionNoteRepository : Repository<DocumentsCollectionNote, Guid>
    {
        public DocumentsCollectionNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }
    }
}

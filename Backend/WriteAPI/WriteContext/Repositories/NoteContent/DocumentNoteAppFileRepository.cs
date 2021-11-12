using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class DocumentNoteAppFileRepository : Repository<DocumentNoteAppFile, Guid>
    {
        public DocumentNoteAppFileRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }
    }
}

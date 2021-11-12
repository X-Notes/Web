using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class PhotoNoteAppFileRepository : Repository<PhotoNoteAppFile, Guid>
    {
        public PhotoNoteAppFileRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }
    }
}

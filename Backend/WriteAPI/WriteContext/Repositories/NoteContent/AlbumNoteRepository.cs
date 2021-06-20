using Common.DatabaseModels.models.NoteContent;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class AlbumNoteRepository : Repository<AlbumNote, Guid>
    {
        public AlbumNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }
    }
}

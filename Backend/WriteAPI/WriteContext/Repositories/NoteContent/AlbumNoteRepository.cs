using Common.DatabaseModels.models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class AlbumNoteRepository : Repository<AlbumNote>
    {
        public AlbumNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }
    }
}

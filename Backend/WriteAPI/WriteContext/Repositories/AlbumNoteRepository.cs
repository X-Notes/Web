using Common.DatabaseModels.models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class AlbumNoteRepository : Repository<AlbumNote>
    {
        public AlbumNoteRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }
    }
}

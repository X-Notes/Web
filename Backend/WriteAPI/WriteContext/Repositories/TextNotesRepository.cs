using Common.DatabaseModels.models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class TextNotesRepository : Repository<TextNote>
    {
        public TextNotesRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
            
        }
    }
}

using Common.DatabaseModels.models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class BaseNoteContentRepository : Repository<BaseNoteContent>
    {
        public BaseNoteContentRepository(WriteContextDB contextDB)
            :base(contextDB)
        {

        }
    }
}

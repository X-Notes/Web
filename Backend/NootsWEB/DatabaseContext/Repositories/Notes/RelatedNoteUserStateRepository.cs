using Common.DatabaseModels.Models.Notes;
using DatabaseContext.GenericRepositories;

namespace DatabaseContext.Repositories.Notes
{
    public class RelatedNoteUserStateRepository : Repository<RelatedNoteUserState, int>
    {
        public RelatedNoteUserStateRepository(ApiDbContext contextDB): base(contextDB)
        {
        }
    }
}

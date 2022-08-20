using Common.DatabaseModels.Models.Notes;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Notes
{
    public class RelatedNoteUserStateRepository : Repository<RelatedNoteUserState, int>
    {
        public RelatedNoteUserStateRepository(NootsDBContext contextDB): base(contextDB)
        {
        }
    }
}

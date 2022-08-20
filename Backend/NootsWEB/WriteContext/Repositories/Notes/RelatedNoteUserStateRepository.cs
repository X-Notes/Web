using Common.DatabaseModels.Models.Notes;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notes
{
    public class RelatedNoteUserStateRepository : Repository<RelatedNoteUserState, int>
    {
        public RelatedNoteUserStateRepository(WriteContextDB contextDB): base(contextDB)
        {
        }
    }
}

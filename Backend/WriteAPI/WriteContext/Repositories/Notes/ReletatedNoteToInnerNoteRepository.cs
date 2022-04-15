using System;
using Common.DatabaseModels.Models.Notes;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notes
{
    public class ReletatedNoteToInnerNoteRepository : Repository<ReletatedNoteToInnerNote, Guid>
    {
        public ReletatedNoteToInnerNoteRepository(WriteContextDB contextDB)
                : base(contextDB)
        {

        }
    }
}

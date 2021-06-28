using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Labels;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Labels
{
    public class LabelsNotesRepository : Repository<LabelsNotes, Guid>
    {
        public LabelsNotesRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }
    }
}

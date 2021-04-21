using Common.DatabaseModels.models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class LabelsNotesRepository : Repository<LabelsNotes>
    {
        public LabelsNotesRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }
    }
}

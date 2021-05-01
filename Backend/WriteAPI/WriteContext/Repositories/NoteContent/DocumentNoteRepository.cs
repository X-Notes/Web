using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class DocumentNoteRepository : Repository<DocumentNote>
    {
        public DocumentNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class DocumentNoteRepository : Repository<DocumentNote, Guid>
    {
        public DocumentNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class VideoNoteRepository : Repository<VideoNote, Guid>
    {
        public VideoNoteRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }
    }
}

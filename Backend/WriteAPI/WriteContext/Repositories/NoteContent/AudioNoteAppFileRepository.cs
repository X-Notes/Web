using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class AudioNoteAppFileRepository : Repository<AudioNoteAppFile, Guid>
    {
        public AudioNoteAppFileRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }
    }
}

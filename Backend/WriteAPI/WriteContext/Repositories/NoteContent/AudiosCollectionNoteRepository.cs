using System;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class AudiosCollectionNoteRepository : Repository<AudiosCollectionNote, Guid>
    {
        public AudiosCollectionNoteRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }
    }
}

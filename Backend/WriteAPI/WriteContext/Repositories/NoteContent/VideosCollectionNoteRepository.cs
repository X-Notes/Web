using System;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class VideosCollectionNoteRepository : Repository<VideosCollectionNote, Guid>
    {
        public VideosCollectionNoteRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }
    }
}

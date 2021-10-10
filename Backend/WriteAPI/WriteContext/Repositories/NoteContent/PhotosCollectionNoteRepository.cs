using System;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class PhotosCollectionNoteRepository : Repository<PhotosCollectionNote, Guid>
    {
        public PhotosCollectionNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }
    }
}

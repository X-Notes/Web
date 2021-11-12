using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class VideoNoteAppFileRepository : Repository<VideoNoteAppFile, Guid>
    {
        public VideoNoteAppFileRepository(WriteContextDB contextDB)
                : base(contextDB)
        {
        }
    }
}

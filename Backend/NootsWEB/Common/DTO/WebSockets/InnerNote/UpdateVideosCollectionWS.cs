using Common.DTO.Notes.FullNoteContent;
using System;

namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateVideosCollectionWS : BaseUpdateFileContentWS<VideosCollectionNoteDTO>
    {
        public UpdateVideosCollectionWS(Guid contentId, UpdateOperationEnum operation, DateTimeOffset time) : base(contentId, operation, time)
        {
        }
    }
}

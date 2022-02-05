using Common.DTO.Notes.FullNoteContent;
using System;

namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdatePhotosCollectionWS : BaseUpdateFileContentWS<PhotosCollectionNoteDTO>
    {
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public UpdatePhotosCollectionWS(Guid contentId, UpdateOperationEnum operation, DateTimeOffset time) : base(contentId, operation, time)
        {
        }
    }
}

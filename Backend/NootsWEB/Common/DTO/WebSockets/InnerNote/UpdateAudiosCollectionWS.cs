using Common.DTO.Notes.FullNoteContent;
using System;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateAudiosCollectionWS : BaseUpdateFileContentWS<AudiosCollectionNoteDTO>
    {
        public UpdateAudiosCollectionWS(Guid contentId, UpdateOperationEnum operation, DateTimeOffset time) : base(contentId, operation, time)
        {
        }
    }
}

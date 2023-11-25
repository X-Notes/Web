using Common.DTO.Notes.FullNoteContent;
using System;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateAudiosCollectionWS : BaseUpdateFileContentWS<AudiosCollectionNoteDTO>
    {
        public UpdateAudiosCollectionWS(Guid contentId, UpdateOperationEnum operation, DateTimeOffset time, int version) : base(contentId, operation, time, version)
        {
        }
    }
}

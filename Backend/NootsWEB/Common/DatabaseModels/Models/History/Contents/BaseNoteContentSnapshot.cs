using Common.DatabaseModels.Models.NoteContent;
using Common.Interfaces.Note;
using System;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class BaseNoteContentSnapshot: IBaseNoteContent
    {
        public int Order { set; get; }
        public ContentTypeENUM ContentTypeId { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }

        public BaseNoteContentSnapshot(int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt)
        {
            Order = order;
            ContentTypeId = contentTypeId;
            UpdatedAt = updatedAt;
        }
    }
}

using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets.InnerNote
{
    public class BaseUpdateFileContentWS<T> where T : BaseNoteContentDTO
    {
        public Guid ContentId { set; get; }

        public IEnumerable<Guid> CollectionItemIds { set; get; }

        public UpdateOperationEnum Operation { set; get; }

        public T Collection { set; get; }

        public string Name { set; get; }

        public DateTimeOffset EntityTime { set; get; }

        public int Version { set; get; }

        public BaseUpdateFileContentWS(Guid contentId, UpdateOperationEnum operation, DateTimeOffset entityTime, int version)
        {
            ContentId = contentId;
            Operation = operation;
            EntityTime = entityTime;
            Version = version;
        }
    }
}

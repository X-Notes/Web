using System.Collections.Generic;

namespace Common.DatabaseModels.Models.NoteContent
{
    public class ContentType : BaseEntity<ContentTypeENUM>
    {
        public string Name { set; get; }
        public List<BaseNoteContent> BaseNoteContents { set; get; }
    }
}

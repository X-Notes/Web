using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table(nameof(ContentType), Schema = SchemeConfig.Note)]
    public class ContentType : BaseEntity<ContentTypeENUM>
    {
        public string Name { set; get; }
        public List<BaseNoteContent> BaseNoteContents { set; get; }
    }
}

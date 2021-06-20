using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.NoteContent
{
    public class ContentType : BaseEntity<ContentTypeENUM>
    {
        public string Name { set; get; }
        public List<BaseNoteContent> BaseNoteContents { set; get; }
    }
}

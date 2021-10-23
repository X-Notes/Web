using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using System.Collections.Generic;

namespace Common.Interfaces.Note
{
    public interface IBaseNote
    {
        public NoteTypeENUM NoteTypeId { set; get; }
        public NoteType NoteType { set; get; }

        public RefTypeENUM RefTypeId { set; get; }
        public RefType RefType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }

        public List<BaseNoteContent> Contents { set; get; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class FoldersNotes
    {
        public Guid FolderId { get; set; }
        public Folder Folder { get; set; }
        public Guid NoteId { get; set; }
        public Note Note { get; set; }
    }
}

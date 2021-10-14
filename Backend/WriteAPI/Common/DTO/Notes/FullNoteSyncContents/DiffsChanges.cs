using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteSyncContents
{
    public class DiffsChanges
    {
        public List<PositionDiff> Positions { set; get; }
        public List<Guid> RemovedItems { set; get; }
        public List<NewRowDiff<TextNoteDTO>> NewItems { set; get; }
    }
}

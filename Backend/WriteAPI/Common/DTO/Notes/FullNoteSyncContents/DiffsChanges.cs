using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteSyncContents
{
    public class DiffsChanges
    {
        public List<PositionDiff> Positions { set; get; }
        public List<ItemForRemove> RemovedItems { set; get; }
        public List<TextNoteDTO> NewTextItems { set; get; }

        // BASE FILE
        public List<BaseNoteContentDTO> PhotosCollectionItems { set; get; }
        public List<BaseNoteContentDTO> AudiosCollectionItems { set; get; }
        public List<BaseNoteContentDTO> VideosCollectionItems { set; get; }
        public List<BaseNoteContentDTO> DocumentsCollectionItems { set; get; }
    }
}

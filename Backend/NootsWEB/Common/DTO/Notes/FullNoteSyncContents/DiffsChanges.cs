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
        public List<PhotosCollectionNoteDTO> PhotosCollectionItems { set; get; }
        public List<AudiosCollectionNoteDTO> AudiosCollectionItems { set; get; }
        public List<VideosCollectionNoteDTO> VideosCollectionItems { set; get; }
        public List<DocumentsCollectionNoteDTO> DocumentsCollectionItems { set; get; }
    }
}

using Common.DTO.Notes.FullNoteContent;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteSyncContents
{
    public class DiffsChanges
    {
        public List<PositionDiff> Positions { set; get; }
        public List<ItemForRemove> RemovedItems { set; get; }
        public List<NewTextContent> NewTextItems { set; get; }

        // BASE FILE
        public List<NewCollectionContent> PhotosCollectionItems { set; get; }

        public List<NewCollectionContent> AudiosCollectionItems { set; get; }

        public List<NewCollectionContent> VideosCollectionItems { set; get; }

        public List<NewCollectionContent> DocumentsCollectionItems { set; get; }
    }
}

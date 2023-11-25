using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteSyncContents
{
    public class DiffsChanges
    {
        public List<PositionDiff> Positions { set; get; }
        public List<ItemForRemove> RemovedItems { set; get; }
        public List<NewTextContent> NewTextItems { set; get; }

        // BASE FILE
        public List<NewCollectionContent> CollectionItems { set; get; }

        public int GetNewItemsCount()
        {
            var addTextsCount = NewTextItems == null ? 0 : NewTextItems.Count;
            var addCollectionCount = CollectionItems == null ? 0 : CollectionItems.Count;

            return addTextsCount + addCollectionCount;
        }
    }
}

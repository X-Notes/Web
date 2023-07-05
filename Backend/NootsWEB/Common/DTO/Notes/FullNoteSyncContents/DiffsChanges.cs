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

        public int GetNewItemsCount()
        {
            var addTextsCount = NewTextItems == null ? 0 : NewTextItems.Count;
            var addPhotosCount = PhotosCollectionItems == null ? 0 : PhotosCollectionItems.Count;
            var addAudiosCount = AudiosCollectionItems == null ? 0 : AudiosCollectionItems.Count;
            var addVideoCount = VideosCollectionItems == null ? 0 : VideosCollectionItems.Count;
            var addDocumentsCount = DocumentsCollectionItems == null ? 0 : DocumentsCollectionItems.Count;

            return addTextsCount + addPhotosCount + addAudiosCount + addVideoCount + addDocumentsCount;
        }
    }
}

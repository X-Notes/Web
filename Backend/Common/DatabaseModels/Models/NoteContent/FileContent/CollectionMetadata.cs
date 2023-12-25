

using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    public class CollectionMetadata
    {
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public FileTypeEnum FileTypeId { set; get; }

        public string Name { set; get; }
    }
}
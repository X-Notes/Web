
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;

namespace Common.Interfaces.Note
{
    public interface ICollectionNote
    {
        public string Metadata { set; get; }

        public FileTypeEnum FileTypeId { set; get; }

        public string Name { set; get; }
    }
}

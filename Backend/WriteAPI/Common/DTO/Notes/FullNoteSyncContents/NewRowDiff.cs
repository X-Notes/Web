using Common.DTO.Notes.FullNoteContent;

namespace Common.DTO.Notes.FullNoteSyncContents
{
    public class NewRowDiff<T> where T : BaseNoteContentDTO
    {
        public int Order { set; get; }

        public T Data { set; get; }
    }
}

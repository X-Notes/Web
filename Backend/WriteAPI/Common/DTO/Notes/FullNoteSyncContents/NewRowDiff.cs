using Common.DTO.Notes.FullNoteContent;

namespace Common.DTO.Notes.FullNoteSyncContents
{
    public class NewRowDiff<T> where T : BaseContentNoteDTO
    {
        public int Index { set; get; }

        public T Data { set; get; }
    }
}

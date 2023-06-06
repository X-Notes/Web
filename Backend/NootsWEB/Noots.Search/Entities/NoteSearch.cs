namespace Noots.Search.Entities
{
    public class NoteSearch
    {
        public Guid NoteId { set; get; }

        public string NoteTitle { set; get; }

        public List<string> Contents { set; get; } = new List<string>();

        public NoteSearch(Guid noteId, string noteTitle)
        {
            NoteId = noteId;
            NoteTitle = noteTitle;
        }
    }
}

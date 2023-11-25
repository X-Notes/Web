namespace Search.Entities
{
    public class SearchNoteFolderResult
    {
        public List<NoteSearch>? NotesResult { set; get; }

        public List<FolderSearch>? FoldersResult { set; get; }
    }
}

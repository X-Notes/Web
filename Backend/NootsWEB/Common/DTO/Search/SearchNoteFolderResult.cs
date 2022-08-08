using System.Collections.Generic;

namespace Common.DTO.Search
{
    public class SearchNoteFolderResult
    {
        public List<NoteSearch> NoteSearchs { set; get; }
        public List<FolderSearch> FolderSearchs { set; get; }
    }
}

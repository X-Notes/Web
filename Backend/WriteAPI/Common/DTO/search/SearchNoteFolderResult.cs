using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.search
{
    public class SearchNoteFolderResult
    {
        public List<NoteSearch> NoteSearchs { set; get; }
        public List<FolderSearch> FolderSearchs { set; get; }
    }
}

using System.Collections.Generic;

namespace Common.DTO.Folders
{
    public class SmallFolder : BaseFolderDTO
    {
        public int Order { set; get; }

        public List<NotePreviewInFolder> PreviewNotes { set; get; }
    }
}

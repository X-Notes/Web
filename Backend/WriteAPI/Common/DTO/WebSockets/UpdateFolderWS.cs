using Common.DTO.Folders;
using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets
{
    public class UpdateFolderWS
    {
        public Guid FolderId { set; get; }

        public string Color { set; get; }

        public string Title { set; get; }

        public List<NotePreviewInFolder> PreviewNotes { set; get; }
    }
}

using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using Common.Interfaces;

namespace Common.DTO.Folders
{
    public class SmallFolder : BaseFolderDTO
    {
        public int Order { set; get; }

        public Guid UserId { set; get; }

        public bool IsCanEdit { set; get; }

        public List<NotePreviewInFolder> PreviewNotes { set; get; }
    }
}

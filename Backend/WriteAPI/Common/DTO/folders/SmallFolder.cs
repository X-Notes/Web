using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.Systems;
using Common.DTO.app;
using System;
using System.Collections.Generic;

namespace Common.DTO.folders
{
    public class SmallFolder
    {
        public Guid Id { get; set; }

        public string Title { set; get; }

        public string Color { set; get; }

        public RefTypeENUM RefTypeId { set; get; }

        public FolderTypeENUM FolderTypeId { set; get; }

        public DateTimeOffset DeletedAt { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }

        public DateTimeOffset CreatedAt { set; get; }

        public List<NotePreviewInFolder> PreviewNotes { set; get; }
    }
}

using Common.DTO.Folders;
using Common.DTO.Notes;
using Noots.RGA_CRDT;
using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets
{
    public class UpdateFolderWS
    {
        public Guid FolderId { set; get; }

        public string Color { set; get; }

        public List<MergeTransaction<string>> TitleTransactions { set; get; }

        public bool IsUpdateTitle { set; get; }

        public List<EntityPositionDTO> Positions { set; get; } = new();

        public List<Guid> IdsToAdd { set; get; } = new();

        public List<Guid> IdsToRemove { private set; get; } = new();

        public List<NotePreviewInFolder> PreviewNotes { set; get; } = new();
    }
}

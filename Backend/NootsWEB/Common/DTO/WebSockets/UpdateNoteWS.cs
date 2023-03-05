using Common.DTO.Labels;
using Noots.RGA_CRDT;
using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets
{
    public class UpdateNoteWS
    {
        public Guid NoteId { set; get; }

        public string Color { set; get; }

        public MergeTransaction<string> TitleTransaction { set; get; }

        public bool IsUpdateTitle { set; get; }

        public List<Guid> RemoveLabelIds { set; get; }

        public List<LabelDTO> AddLabels { set; get; }


    }
}

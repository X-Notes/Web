using Common.DTO.Labels;
using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets
{
    public class UpdateNoteWS
    {
        public Guid NoteId { set; get; }

        public string Color { set; get; }

        public string Title { set; get; }

        public List<LabelDTO> Labels { set; get; }
    }
}

using Common.DTO.Notes;
using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets.ReletedNotes
{
    public class UpdateRelatedNotesWS
    {
        public Guid NoteId { set; get; }

        public List<EntityPositionDTO> Positions { set; get; }

        public List<Guid> IdsToRemove { set; get; }

        public List<Guid> IdsToAdd { set; get; }

        public UpdateRelatedNotesWS(Guid noteId)
        {
                NoteId = noteId;
        }
    }
}

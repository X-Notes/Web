using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateNoteStructureWS
    {
        public List<Guid> ContentIdsToDelete { get; set; }


        public List<TextNoteDTO> TextContentsToAdd { set; get; }


        public List<BaseNoteContentDTO> PhotoContentsToAdd { set; get; }

        public List<BaseNoteContentDTO> VideoContentsToAdd { set; get; }

        public List<BaseNoteContentDTO> AudioContentsToAdd { set; get; }

        public List<BaseNoteContentDTO> DocumentContentsToAdd { set; get; }

        public List<UpdateContentPositionWS> Positions { set; get; }
    }
}

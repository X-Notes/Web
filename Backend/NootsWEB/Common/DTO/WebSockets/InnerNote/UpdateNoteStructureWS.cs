using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateNoteStructureWS
    {
        public List<Guid> ContentIdsToDelete { get; set; }


        public List<TextNoteDTO> TextContentsToAdd { set; get; }


        public List<PhotosCollectionNoteDTO> PhotoContentsToAdd { set; get; }

        public List<VideosCollectionNoteDTO> VideoContentsToAdd { set; get; }

        public List<AudiosCollectionNoteDTO> AudioContentsToAdd { set; get; }

        public List<DocumentsCollectionNoteDTO> DocumentContentsToAdd { set; get; }

        public List<UpdateContentPositionWS> Positions { set; get; }
    }
}

using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;
using Common.DTO.Notes.FullNoteContent.Text;


namespace Common.DTO.WebSockets.InnerNote;

public class UpdateNoteStructureWS
{
    public List<Guid> ContentIdsToDelete { get; set; }

    public List<TextNoteDto> TextContentsToAdd { set; get; }

    public List<BaseNoteContentDTO> CollectionContentsToAdd { set; get; }

    public List<UpdateContentPositionWS> Positions { set; get; }
}

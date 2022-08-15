using Common.DTO.Notes.FullNoteContent;
using System;

namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateTextWS
    {
        public TextNoteDTO Collection { set; get; }

        public UpdateTextWS(TextNoteDTO collection)
        {
            Collection = collection;    
        }
    }
}

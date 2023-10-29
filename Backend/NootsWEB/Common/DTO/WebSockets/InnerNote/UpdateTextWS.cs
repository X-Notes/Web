using Common.DTO.Notes.FullNoteContent;
using System;
using Common.DTO.Notes.FullNoteContent.Text;

namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateTextWS
    {
        public TextNoteDto Collection { set; get; }

        public UpdateTextWS(TextNoteDto collection)
        {
            Collection = collection;    
        }
    }
}

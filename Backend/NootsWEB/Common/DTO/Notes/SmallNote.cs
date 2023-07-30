using System;
using System.Collections.Generic;
using Common.DTO.Notes.FullNoteContent;

namespace Common.DTO.Notes
{
    public class SmallNote : BaseNoteDTO
    {
        public int Order { set; get; }

        public List<BaseNoteContentDTO> Contents { set; get; }
    }
}

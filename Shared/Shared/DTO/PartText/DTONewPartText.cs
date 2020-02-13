using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.PartText
{
    public class DTONewPartText
    {
        public string NoteId { set; get; }
        public int Order { set; get; }
        public string Text { set; get; }
    }
}

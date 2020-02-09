using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.PartText
{
    public class DTOPartText
    {
        public ObjectId NoteId { set; get; }
        public ObjectId PartId { set; get; }
        public string Text { set; get; }
    }
}

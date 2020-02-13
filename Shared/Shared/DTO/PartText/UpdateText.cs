using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.PartText
{
    public class UpdateText
    {
        public string NoteId { set; get; }
        public string PartId { set; get; }
        public string Description { set; get; }
    }
}

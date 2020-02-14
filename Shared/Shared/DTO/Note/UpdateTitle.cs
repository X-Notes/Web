using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.Note
{
    public class UpdateTitle
    {
        public string Id { set; get; }
        public string Title { set; get; }
    }
}
